import { Model, Transaction } from 'sequelize';
import { Rental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { CronJob } from 'cron';

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
            const scooterReservation = await ReservationManager.getReservationFromScooter(scooterId, transaction);
            if(scooter.getDataValue('active_rental_id') !== null || (scooterReservation && scooterReservation.dataValues.user_id !== userId)) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // all good?
            // start the new rental
            expiration = new Date(Date.now() + rental_duration_ms);
            rental = await Rental.create({ user_id: userId, scooter_id: scooterId, endedAt: expiration }, { transaction: transaction });
            scooter.setDataValue('active_rental_id', rental.dataValues.id);
            await scooter.save({transaction: transaction});

            /* End the reservation for the user if it exists (even if it's for another scooter) */
            const userReservation = await ReservationManager.getReservationFromUser(userId, transaction);
            if(userReservation) {
              if (userReservation.getDataValue('scooter_id') === scooter.getDataValue('id')) {
                /* If the reservation is for the same scooter, send the scooter as well so that we don't have to fetch it again */
                await ReservationManager.endReservation(userReservation, transaction, scooter);
              } else {
                await ReservationManager.endReservation(userReservation, transaction);
              }
            }
            
            if(!transactionExtern) await transaction.commit();

            // Dispatch a job to end the rental when it expires
            this.scheduleRentalEnding(rental);
        } catch (error) {
            console.log(error);
            if(!transactionExtern) await transaction.rollback();
            throw new Error(error.message);
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
            // await rental.destroy({transaction: transaction}); // this will be needed when we start booking dynamically!
            scooter.setDataValue('active_rental_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RENTAL_FAILED');
        }
        return;
    }

    // given a rental, schedule a cronjob to end it at its expiration
    public static scheduleRentalEnding(rental: Model): void {
        const expiration: Date = rental.getDataValue('endedAt');

        /* If the expiration is not in the future, don't schedule a CronJob */
        const now = new Date();
        if (expiration <= now) {
            return;
        }

        console.log(`scheduling rental ending at ${expiration}`);

        new CronJob(
            expiration,
            async () => {
                try {
                    await this.endRental(rental);
                    console.log('ended rental');
                } catch (error) {
                    console.error(`could not end rental at scheduled time!\n${error}`);
                }
            },
            null,
            true // start now
        );
    }
}

export default RentalManager;
