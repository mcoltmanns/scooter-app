import { Model, Transaction } from 'sequelize';
import { Rental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { Job, scheduleJob } from 'node-schedule';
import JobManager from './job-manager';

abstract class RentalManager {
    // get all rentals associated with a scooter (active and ended)
    public static async getRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { scooter_id: scooterId } });
    }

    // get all rentals associated with a user
    public static async getRentalsFromUser(userId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { user_id: userId } });
    }

    // set a scooter as rented for a user, if possible (scooter is free)
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    public static async startRental(userId: number, scooterId: number, rental_duration_ms: number, transaction?: Transaction, scooter?: Model): Promise<Model> {
        let rental: Model;
        let expiration: Date;
        const transactionExtern: boolean = transaction !== undefined;
        
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        
        try {
            /* Fetch the scooter if it wasn't provided */
            if (!scooter) {
              scooter = await Scooter.findByPk(scooterId, { transaction: transaction });
            }
            if(!scooter) throw new Error('SCOOTER_NOT_FOUND');

            // can't book if scooter is reserved by someone else or rented
            const reservation = await ReservationManager.getReservationFromScooter(scooterId, transaction);
            if(scooter.getDataValue('active_rental_id') !== null || (reservation && reservation.dataValues.user_id !== userId)) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // all good?
            // start the new rental
            expiration = new Date(Date.now() + rental_duration_ms);
            rental = await Rental.create({ user_id: userId, scooter_id: scooterId, endedAt: expiration }, { transaction: transaction });
            scooter.setDataValue('active_rental_id', rental.dataValues.id);
            await scooter.save({transaction: transaction});

            if(reservation) await ReservationManager.endReservation(reservation, transaction, scooter); // if there was a reservation, end it
            
            if(!transactionExtern) await transaction.commit();

            // dispatch a job to end the rental when it expires
            this.scheduleRentalEnding(rental);
        } catch (error) {
            console.log(error);
            if(!transactionExtern) await transaction.rollback();
            throw new Error('RENTAL_FAILED');
        }
        return rental;
    }

    // extend a rental (set a new reservation expiration time)
    public static async extendRental(userId: number, rentalId: number, extension_time_ms: number, transaction?: Transaction, rental?: Model): Promise<Model> {
        const expiration: number = Date.now() + extension_time_ms;
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();

        if(!rental) {
            rental = await Scooter.findByPk(rentalId, {transaction: transaction});
        }
        if(!rental) throw new Error('RENTAL_NOT_FOUND');
        
        // can't extend if rental isn't yours
        if(rental.getDataValue('user_id') !== userId) {
            throw new Error('NOT_YOUR_RENTAL');
        }

        // extend the rental
        rental.setDataValue('endedAt', expiration);
        JobManager.rescheduleJob(rental.getDataValue('id'), expiration);
        try {
            await rental.save({transaction: transaction});
        } catch (error) {
            console.log('could not extend rental!');
            await transaction.rollback();
            throw new Error('EXTENSION_FAILED');
        }
        return rental;
    }

    // end a rental, freeing the scooter
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    public static async endRental(rental: Model, transaction?: Transaction): Promise<void> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            const scooter = await Scooter.findByPk(rental.getDataValue('scooter_id'));
            scooter.setDataValue('active_rental_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
            JobManager.removeJob(`rental${rental.getDataValue('id')}`); // remove yourself when done
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RENTAL_FAILED');
        }
        return;
    }

    // given a rental, schedule a job to end it at its expiration
    // job's id will be the 'rental${rental.id}'
    public static scheduleRentalEnding(rental: Model): Job {
        const expiration: Date = rental.getDataValue('endedAt');
        console.log(`scheduling rental ending at ${expiration}`);
        const j = scheduleJob(`rental${rental.getDataValue('id')}`, expiration, async () => {
            try {
                await this.endRental(rental);
                console.log('ended rental');
            } catch (error) {
                console.error(`could not end rental at scheduled time!\n${error}`);
            }
        });
        JobManager.addJob(j);
        return j;
    }
}

export default RentalManager;
