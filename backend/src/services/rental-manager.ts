import { Model, Transaction } from 'sequelize';
import { ActiveRental, PastRental, Rental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { scheduleJob } from 'node-schedule';
import { TransactionManager } from './payment/transaction-manager';

const EXTENSION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between rental extension checks
//const MAX_RENTAL_DURATION_MS = 12 * 60 * 60 * 1000; // how long can a dynamic rental go before it's forced to end?

abstract class RentalManager {
    // get all rentals associated with a scooter (active and ended)
    public static async getRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { scooter_id: scooterId } });
    }

    // get all rentals associated with a user
    public static async getRentalsFromUser(userId: number): Promise<[Model[], Model[]]> {
        return [await ActiveRental.findAll({ where: { userId: userId } }), await PastRental.findAll({ where: { userId: userId }})];
    }

    // get all active rentals associated with a scooter
    public static async getActiveRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await ActiveRental.findAll({ where: { scooterId: scooterId }});
    }

    // start a dynamic or prepaid rental
    // assumes payment has already gone through
    // checks if scooter is available
    public static async startRental(userId: number, scooterId: number, paymentMethodId: number, price_per_hour: number, rental_duration_ms: number, isDynamic: boolean, transaction?: Transaction, scooter?: Model): Promise<Model> {
        let rental: Model;
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();

        /* After the rental_duration_ms, we will check if the rental should be extended or ended (dynamic rentals will be extended, prepaid rentals will be ended) */
        const nextCheck = new Date(Date.now() + rental_duration_ms);
        
        try {
            /* Fetch the scooter if it wasn't provided */
            if (!scooter) {
                scooter = await Scooter.findByPk(scooterId, { transaction: transaction });
            }
            if(!scooter) throw new Error('SCOOTER_NOT_FOUND');

            // can't book if scooter is reserved by someone else or rented
            const reservation = await ReservationManager.getReservationFromScooter(scooterId, transaction);
            const rentals = await RentalManager.getActiveRentalsFromScooter(scooterId);
            if(rentals.length > 0 || (reservation && reservation.dataValues.user_id !== userId)) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // all good?
            // start the new rental
            if(reservation) await ReservationManager.endReservation(reservation, transaction, scooter); // if there was a reservation, end it
            rental = await ActiveRental.create({ userId: userId, scooterId: scooterId, paymentMethodId: paymentMethodId, nextActionTime: nextCheck, price_per_hour: price_per_hour, renew: isDynamic }, { transaction: transaction }); // create the entry in the rentals table

            RentalManager.scheduleRentalCheck(rental.dataValues.id, nextCheck); // schedule the check
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            console.log(`could not start rental!\n${error}`);
            if(!transactionExtern) await transaction.rollback();
            throw new Error('RENTAL_FAILED');
        }
        return rental;
    }

    public static async endRental(rentalId: number, transaction?: Transaction): Promise<void> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            const rental = await ActiveRental.findByPk(rentalId, { transaction: transaction });
            if(!rental) return; // do nothing if rental not found
            const total_price = rental.dataValues.price_per_hour * ((Date.now() - new Date(rental.dataValues.createdAt).getTime()) / 1000 / 60 / 60) ;
            await PastRental.create({ endedAt: new Date(Date.now()), total_price: total_price, userId: rental.dataValues.userId, scooterId: rental.dataValues.scooterId, paymentMethodId: rental.dataValues.paymentMethodId, createdAt: new Date(rental.dataValues.createdAt) }, { transaction: transaction }); // move rental to the past rentals
            await rental.destroy({ transaction: transaction }); // deactivate the rental
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RENTAL_FAILED');
        }
    }

    public static scheduleRentalCheck(rentalId: number, time: Date): void {
        console.log(`scheduling rental check at ${time} for rental ${rentalId}`);
        scheduleJob(`rental${rentalId}`, time, RentalManager.checkRental.bind(rentalId, rentalId)); // schedule the check
    }

    public static async checkRental(rentalId: number): Promise<void> {
        console.log(`checking rental ${rentalId}`);
        const transaction = await database.getSequelize().transaction();
        try {
            // find the rental we want to check
            const rental = await ActiveRental.findByPk(rentalId, { transaction: transaction });
            if(!rental) return; // do nothing if no rental found

            if(rental.dataValues.renew) { // rental is dynamic and should be renewed
                console.log(`renewing rental ${rentalId}`);
                // try to pay for the next block
                const nextTime = Date.now() + EXTENSION_INTERVAL_MS;
                const nextBlockPrice = rental.dataValues.price_per_hour / 60 / 60 / 1000 * EXTENSION_INTERVAL_MS;
                try {
                    await TransactionManager.doTransaction(rental.dataValues.paymentMethodId, rental.dataValues.userId, nextBlockPrice); // try pay for next block
                    // schedule the next check
                    RentalManager.scheduleRentalCheck(rentalId, new Date(nextTime));
                } catch (error) { // cancel if unable
                    console.log(`could not extend rental ${rental.dataValues.id} - unable to pay for next block\n${error}`);
                    await RentalManager.endRental(rentalId, transaction);
                }
            }
            else { // rental is prepaid and should be ended
                console.log(`ending rental ${rentalId}`);
                await RentalManager.endRental(rentalId, transaction);
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.log(`check on rental ${rentalId} failed!\n${error}`);
        }
    }
}

export default RentalManager;
