import { Model, Transaction } from 'sequelize';
import { Rental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { Job, scheduleJob } from 'node-schedule';
import { TransactionManager } from './payment/transaction-manager';
import { Product } from '../models/product';

const EXTENSION_INTERVAL_MS = 5 * 60 * 1000; // how long between rental extension checks?
const MAX_RENTAL_DURATION_MS = 12 * 60 * 60 * 1000; // how long can a dynamic rental go before it's forced to end?

abstract class RentalManager {
    // get all rentals associated with a scooter (active and ended)
    public static async getRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { scooter_id: scooterId } });
    }

    // get all rentals associated with a user
    public static async getRentalsFromUser(userId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { user_id: userId } });
    }

    // start a static rental (fixed end time)
    // set a scooter as rented for a user, if possible (scooter is free)
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    public static async startRentalStatic(userId: number, scooterId: number, rental_duration_ms: number, transaction?: Transaction, scooter?: Model): Promise<Model> {
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

            // schedule the rental to end when it's meant to
            this.scheduleRentalEnding(rental, expiration);
        } catch (error) {
            console.log(error);
            if(!transactionExtern) await transaction.rollback();
            throw new Error('RENTAL_FAILED');
        }
        return rental;
    }

    public static async startRentalDynamic(userId: number, scooterId: number, paymentMethodId: number, transaction?: Transaction, scooter?: Model): Promise<Model> {
        // every EXTENSION_INTERVAL_MS, do extendRental
        // including right now!
        return null;
    }

    // extend a rental (set a new reservation expiration time)
    // if the extension would exceed the maximum rental time, end now
    // if the user cannot cover the cost of the extension, end now
    public static async extendRental(userId: number, paymentMethodId: number, price_per_hour: number, rental: Model): Promise<Model> {
        const nextTime = Date.now() + EXTENSION_INTERVAL_MS;
        const nextBlockPrice = price_per_hour / 60 / 60 / 1000 * EXTENSION_INTERVAL_MS;
        try {
            await TransactionManager.doTransaction(paymentMethodId, userId, nextBlockPrice); // try pay for next block
        } catch (error) { // cancel if unable
            console.log(`could not extend rental ${rental.dataValues.id}, ending now (${error})`);
            this.endRental(rental);
            return;
        }
        const finalTime = new Date(rental.getDataValue('createdAt')).getTime() + MAX_RENTAL_DURATION_MS;
        if(nextTime > finalTime) {
            console.log(`rental ${rental.dataValues.id} will exceed maximum time, scheduling forced ending`);
            this.scheduleRentalEnding(rental, new Date(finalTime));
            return;
        }
        scheduleJob(`rental${rental.getDataValue('id')}`, nextTime, this.extendRental.bind(userId, paymentMethodId, price_per_hour, rental)); // schedule another extension when the time comes
        return rental;
    }

    // end a rental right now, freeing the scooter
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    // TODO: if we are ending after the written end date, refund the user what they're owed
    public static async endRental(rental: Model, transaction?: Transaction): Promise<void> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            const scooter = await Scooter.findByPk(rental.getDataValue('scooter_id'));
            scooter.setDataValue('active_rental_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RENTAL_FAILED');
        }
        return;
    }

    // given a rental, schedule a job to end it at its expiration
    // job's id will be the 'rental${rental.id}'
    public static scheduleRentalEnding(rental: Model, expiration: Date): Job {
        console.log(`scheduling rental ending at ${expiration}`);
        const j = scheduleJob(`rental${rental.getDataValue('id')}`, expiration, async function(rental: Model): Promise<void> {
            try {
                await this.endRental(rental);
                console.log('ended rental');
            } catch (error) {
                console.error(`could not end rental at scheduled time!\n${error}`);
            }
        }.bind(rental)); // have to bind in in case of data change
        return j;
    }
}

export default RentalManager;
