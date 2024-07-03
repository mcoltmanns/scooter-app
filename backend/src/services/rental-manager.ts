import { Model, Transaction } from 'sequelize';
import { ActiveRental, PastRental, Rental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { scheduleJob } from 'node-schedule';
import { TransactionManager } from './payment/transaction-manager';
import { DYNAMIC_EXTENSION_INTERVAL_MS } from '../static-data/global-variables';
import { ActiveRentalObject, PastRentalObject } from '../interfaces/rentals.interface';

abstract class RentalManager {
    /* Transform a prepaid ActiveRental object to look like a PastRental object */
    private static transformPaidActiveToPastRental(activeRental: ActiveRentalObject): PastRentalObject {
      const nextActionTime = new Date(activeRental.nextActionTime);
      const createdAt = new Date(activeRental.createdAt);
      const totalPrice = parseFloat((activeRental.price_per_hour * ((nextActionTime.getTime() - createdAt.getTime()) / 1000 / 60 / 60)).toFixed(2));

      return {
          id: activeRental.id,
          endedAt: activeRental.nextActionTime,
          total_price: totalPrice,
          createdAt: activeRental.createdAt,
          userId: activeRental.userId,
          scooterId: activeRental.scooterId,
          paymentMethodId: activeRental.paymentMethodId
      };
    }

    /* Get all rentals that are already fully paid (that includes all past rentals and prepaid active rentals but not dynamic active rentals) */
    public static async getFullyPaidRentalByRentalId(rentalId: number, transaction?: Transaction): Promise<PastRentalObject | null> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            let foundRental: PastRentalObject | null = null;
            const activeRental = await ActiveRental.findOne({
              where: {
                id: rentalId,
                renew: false
              },
              transaction
            });

            if (activeRental) {
              foundRental = RentalManager.transformPaidActiveToPastRental(activeRental.toJSON());
            } else {
              const pastRental = await PastRental.findOne({ where: { id: rentalId }, transaction });
              foundRental = pastRental ? pastRental.toJSON() : null;
            }

            if(!transactionExtern) await transaction.commit();

            return foundRental;
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            console.error(`Error fetching past rental for rentalId ${rentalId}:`, error);
            throw new Error('FETCH_PAST_RENTAL_FAILED');
        }
    }

    /* Get an active rental by rentalId and userId */
    public static async getActiveRentalByRentalIdUserId(rentalId: number, userId: number, transaction?: Transaction): Promise<Model | null> {
      try {
        const activeRental = await ActiveRental.findOne({
          where: {
            id: rentalId,
            userId
          },
          transaction: transaction || undefined
        });

        return activeRental ? activeRental : null;
      } catch (error) {
        throw new Error(error);
      }
    }
    
    // get all rentals associated with a scooter (active and ended)
    public static async getRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { scooter_id: scooterId } });
    }

    public static async getAllRentalsByUserId(userId: number): Promise<{id: number, userId: number, scooterId: number, paymentMethodId: number}[]> {
      const activeRentals = await ActiveRental.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'scooterId', 'paymentMethodId']
      });
      const pastRentals = await PastRental.findAll({
        where: { userId },
        attributes: ['id', 'userId', 'scooterId', 'paymentMethodId']
      });

      const combinedRentals = activeRentals.map(rental => rental.toJSON()).concat(pastRentals.map(rental => rental.toJSON()));
      return combinedRentals;
    }

    // get all rentals associated with a user
    public static async getRentalsFromUser(userId: number): Promise<[Model[], Model[]]> {
        const activeRentals = await ActiveRental.findAll({ where: { userId: userId } });
        const pastRentals = await PastRental.findAll({ where: { userId: userId }});

        if (!activeRentals || !pastRentals) {
          throw new Error('ERROR_FETCHING_RENTALS');
        }

        return [activeRentals, pastRentals];
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
            const scooterReservation = await ReservationManager.getReservationFromScooter(scooterId, transaction);
            const rentals = await RentalManager.getActiveRentalsFromScooter(scooterId);
            // if(scooter.getDataValue('active_rental_id') !== null || (scooterReservation && scooterReservation.dataValues.user_id !== userId)) {
            if(rentals.length > 0 || (scooterReservation && scooterReservation.dataValues.user_id !== userId)) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // all good?
            // start the new rental
            // rental = await Rental.create({ user_id: userId, scooter_id: scooterId, endedAt: nextCheck }, { transaction: transaction });

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

            rental = await ActiveRental.create({ userId: userId, scooterId: scooterId, paymentMethodId: paymentMethodId, nextActionTime: nextCheck, price_per_hour: price_per_hour, renew: isDynamic }, { transaction: transaction }); // create the entry in the rentals table
            // scooter.setDataValue('active_rental_id', rental.dataValues.id);
            // await scooter.save({ transaction: transaction });

            RentalManager.scheduleRentalCheck(rental.dataValues.id, nextCheck); // schedule the check
            if(!transactionExtern) await transaction.commit();
            /* Left here temporarily as reference of the old way using Cron */
            // Dispatch a job to end the rental when it expires
            // this.scheduleRentalEnding(rental);
        } catch (error) {
            console.log(`could not start rental!\n${error}`);
            if(!transactionExtern) await transaction.rollback();
            throw new Error(error.message);
        }
        return rental;
    }

    public static async endRental(rentalId: number, transaction?: Transaction, activeRental?: Model): Promise<Model> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            /* Fetch the activeRental if it wasn't provided */
            if (!activeRental) {
              activeRental = await ActiveRental.findByPk(rentalId, { transaction: transaction });
            }
            if(!activeRental) return; // do nothing if rental not found

            /* Create a past rental entry with the total price */
            const newEndDate = new Date(activeRental.dataValues.nextActionTime);
            const total_price = parseFloat((activeRental.dataValues.price_per_hour * ((newEndDate.getTime() - new Date(activeRental.dataValues.createdAt).getTime()) / 1000 / 60 / 60)).toFixed(2));
            const newPastRental = await PastRental.create({ id: activeRental.dataValues.id, endedAt: newEndDate, total_price: total_price, userId: activeRental.dataValues.userId, scooterId: activeRental.dataValues.scooterId, paymentMethodId: activeRental.dataValues.paymentMethodId, createdAt: new Date(activeRental.dataValues.createdAt) }, { transaction: transaction }); // move rental to the past rentals
            // const total_price = parseFloat((activeRental.dataValues.price_per_hour * ((Date.now() - new Date(activeRental.dataValues.createdAt).getTime()) / 1000 / 60 / 60)).toFixed(2));
            // await PastRental.create({ id: activeRental.dataValues.id, endedAt: new Date(Date.now()), total_price: total_price, userId: activeRental.dataValues.userId, scooterId: activeRental.dataValues.scooterId, paymentMethodId: activeRental.dataValues.paymentMethodId, createdAt: new Date(activeRental.dataValues.createdAt) }, { transaction: transaction }); // move rental to the past rentals
            
            /* End the active rental */
            await activeRental.destroy({ transaction: transaction });

            /* End the active rental entry in the scooters table as well */
            // const scooter = await Scooter.findByPk(rental.getDataValue('scooter_id'), { transaction: transaction });
            // scooter.setDataValue('active_rental_id', null);
            // await scooter.save({ transaction: transaction });

            if(!transactionExtern) await transaction.commit();

            return newPastRental;
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RENTAL_FAILED');
        }
    }

    public static scheduleRentalCheck(rentalId: number, time: Date): void {
        if (time.getTime() < Date.now()) {
          console.log(`SCHEDULER: ${time} is in the past, cannot schedule rental ${rentalId}!`);
          return; // don't schedule if time is in the past
        }

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
                const nextTime = Date.now() + DYNAMIC_EXTENSION_INTERVAL_MS;
                const nextBlockPrice = rental.dataValues.price_per_hour / 60 / 60 / 1000 * DYNAMIC_EXTENSION_INTERVAL_MS;
                try {
                    await TransactionManager.doTransaction(rental.dataValues.paymentMethodId, rental.dataValues.userId, nextBlockPrice, transaction); // try pay for next block

                    /* Update the rental with the new nextActionTime */
                    rental.setDataValue('nextActionTime', new Date(nextTime));
                    await rental.save({ transaction: transaction });

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
