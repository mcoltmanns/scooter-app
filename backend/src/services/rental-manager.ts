import { Model, Op, Sequelize, Transaction } from 'sequelize';
import { ActiveRental, PastRental } from '../models/rental';
import ReservationManager from './reservation-manager';
import { Scooter } from '../models/scooter';
import database from '../database';
import { scheduleJob } from 'node-schedule';
import { TransactionManager } from './payment/transaction-manager';
import { DYNAMIC_EXTENSION_INTERVAL_MS } from '../static-data/global-variables';
import { ActiveRentalObject, PastRentalObject } from '../interfaces/rentals.interface';
import { PaymentService } from '../interfaces/payment-service.interface';
import { CustomError } from '../utils/customError';
import { errorMessages } from '../static-data/error-messages';

abstract class RentalManager {
    /* Transform a prepaid ActiveRental object to look like a PastRental object */
    private static transformPaidActiveToPastRental(activeRental: ActiveRentalObject): PastRentalObject {
      const nextActionTime = new Date(activeRental.nextActionTime);
      const createdAt = new Date(activeRental.createdAt);
      const totalPrice = parseFloat((activeRental.price_per_hour * ((nextActionTime.getTime() - createdAt.getTime()) / 1000 / 60 / 60)).toFixed(2));

      return {
          id: activeRental.id,
          endedAt: activeRental.nextActionTime,
          price_per_hour: activeRental.price_per_hour,
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
            throw new Error(errorMessages.FETCH_PAST_RENTAL_FAILED);
        }
    }

    /* Get an active rental by rentalId and userId, but it locks the row for update */
    public static async getDynamicActiveRentalByRentalIdUserId(rentalId: number, userId: number, transaction?: Transaction): Promise<Model | null> {
      try {
        const activeRental = await ActiveRental.findOne({
          where: {
            id: rentalId,
            renew: true,
            userId
          },
          transaction: transaction || undefined,
          lock: true
        });

        return activeRental ? activeRental : null;
      } catch (error) {
        throw new Error(error);
      }
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
        const activeRentals = await ActiveRental.findAll({ 
          where: { userId: userId },
          attributes: ['id', 'nextActionTime', 'renew', 'price_per_hour', 'paymentOffset', 'createdAt', 'userId', 'scooterId']
        });
        const pastRentals = await PastRental.findAll({
          where: { userId: userId },
          attributes: ['id', 'price_per_hour', 'total_price', 'paymentOffset', 'createdAt', 'endedAt', 'userId', 'scooterId']
        });

        if (!activeRentals || !pastRentals) {
          throw new Error(errorMessages.ERROR_FETCHING_RENTALS);
        }

        return [activeRentals, pastRentals];
    }

    // get all active rentals associated with a scooter
    public static async getActiveRentalsFromScooter(scooterId: number, transaction?: Transaction): Promise<Model[]> {
        return await ActiveRental.findAll({ where: { scooterId: scooterId }, transaction: transaction || undefined });
    }

    // start a dynamic or prepaid rental
    // assumes payment has already gone through
    // checks if scooter is available
    public static async startRental(userId: number, scooterId: number, paymentMethodId: number, paymentToken: string, price_per_hour: number, total_price: number, rental_duration_ms: number, isDynamic: boolean, paymentOffset: number, transaction?: Transaction, scooter?: Model): Promise<Model> {
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
            if(!scooter) throw new Error(errorMessages.SCOOTER_NOT_FOUND);

            // can't book if scooter is reserved by someone else or rented
            const scooterReservation = await ReservationManager.getReservationFromScooter(scooterId, transaction);
            const rentals = await RentalManager.getActiveRentalsFromScooter(scooterId, transaction);
            if(rentals.length > 0 || (scooterReservation && scooterReservation.dataValues.user_id !== userId)) {
                throw new Error(errorMessages.SCOOTER_UNAVAILABLE);
            }

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

            // all good?
            // start the new rental

            rental = await ActiveRental.create({ userId: userId, scooterId: scooterId, paymentMethodId: paymentMethodId, lastPaymentToken: paymentToken, nextActionTime: nextCheck, price_per_hour: price_per_hour, total_price: total_price, renew: isDynamic, paymentOffset: paymentOffset }, { transaction: transaction }); // create the entry in the rentals table

            RentalManager.scheduleRentalCheck(rental.dataValues.id, nextCheck); // schedule the check
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            console.log(`could not start rental!\n${error}`);
            if(!transactionExtern) await transaction.rollback();
            throw new Error(error.message);
        }
        return rental;
    }

    public static async endDynamicRental(activeRental: Model, transaction?: Transaction): Promise<Model> {
      const transactionExtern: boolean = transaction !== undefined;
      if(!transactionExtern) transaction = await database.getSequelize().transaction();

      const correctPaymentStatus = {
        refundedLastBlock: false,
        chargedRemainingAmount: false
      };
      let activeRentalIsEnded = false;
      let payment = null;
      try {
        /* Prepare calculations for correcting the payment. A correction of the payment is often
         * necessary because the user may end the rental before reaching the nextActionTime or
         * due to rounding differences that can accumulate over several dynamic extensions. */
        const currentTime = new Date();
        const nextActionTime = new Date(activeRental.getDataValue('nextActionTime'));
        const lastActionTime = new Date(nextActionTime.getTime() - DYNAMIC_EXTENSION_INTERVAL_MS);  // Calculate the last action time by subtracting the duration of the last piece (i.e. DYNAMIC_EXTENSION_INTERVAL_MS) from the nextActionTime
        const targetPaidDuration = currentTime.getTime() - activeRental.getDataValue('createdAt').getTime();
        payment = {
          currentAmountPaid: parseFloat(activeRental.getDataValue('total_price')), 
          targetAmountPaid: parseFloat((activeRental.getDataValue('price_per_hour') * (targetPaidDuration / (1000 * 60 * 60))).toFixed(2)),  // Convert milliseconds to hours
          currentAmountLastPaidBlock: parseFloat((activeRental.getDataValue('price_per_hour') * ((nextActionTime.getTime() - lastActionTime.getTime()) / (1000 * 60 * 60))).toFixed(2)),  // Convert milliseconds to hours
          paymentOffset: 0
        };
        /* If payment.paymentOffset > 0, the user has paid too much
         * If payment.paymentOffset < 0, the user has paid too little
         * If payment.paymentOffset = 0, the user has paid exactly the correct amount */

        console.log('endDynamicRental (payment before correction):', payment);

        /* Correct the payment if the user has paid too much.
         * We will refund the last paid block and then charge the user for the actual time used. */
        if (payment.currentAmountPaid > payment.targetAmountPaid) {
          try {
            console.log('endDynamicRental: Correcting the payment of user', activeRental.getDataValue('userId'), 'for rental', activeRental.getDataValue('id') + ', because the user has paid too much...');
            const paymentOffset = parseFloat((payment.currentAmountPaid - payment.targetAmountPaid).toFixed(2));
            
            /* Refund the complete last paid block. */
            const { paymentService, paymentData } = await TransactionManager.getPaymentService(activeRental.getDataValue('paymentMethodId'), activeRental.getDataValue('userId'), transaction);
            if (activeRental.getDataValue('lastPaymentToken') !== 'null') {
              console.log('endDynamicRental: Refunding the last paid block of', payment.currentAmountLastPaidBlock, '€...');
              await TransactionManager.rollbackTransaction(paymentService, activeRental.getDataValue('lastPaymentToken'));
              
              /* Update the currentAmountPaid to reflect the refunded amount */
              payment.currentAmountPaid = parseFloat((payment.currentAmountPaid - payment.currentAmountLastPaidBlock).toFixed(2));

              correctPaymentStatus.refundedLastBlock = true;  // Update the status

              console.log('endDynamicRental: Refunded the last paid block of', payment.currentAmountLastPaidBlock, '€.');
            } else {
              throw new Error(errorMessages.NO_PAYMENT_TOKEN);
            }

            if (paymentOffset > payment.currentAmountLastPaidBlock) {
              // console.log('User has overpaid more than the last paid block can refund.');

              /* If the user has overpaid more than the last paid block, save the still overpaid amount */
              payment.paymentOffset = parseFloat((paymentOffset - payment.currentAmountLastPaidBlock).toFixed(2));
            } else {
              /* Charge the amount the user has paid too little after refunding the last paid block. */
              const amountToCharge = parseFloat((payment.targetAmountPaid - payment.currentAmountPaid).toFixed(2));
              if (amountToCharge > 0) {
                console.log('endDynamicRental: Charging ' + amountToCharge + ' €...');

                await TransactionManager.doTransaction(activeRental.getDataValue('paymentMethodId'), activeRental.getDataValue('userId'), amountToCharge, transaction, paymentService, paymentData);

                /* Update the currentAmountPaid to reflect the just charged amount */
                payment.currentAmountPaid = parseFloat((payment.currentAmountPaid + amountToCharge).toFixed(2));

                correctPaymentStatus.chargedRemainingAmount = true;  // Update the status

                console.log('endDynamicRental: Charged ' + amountToCharge + ' €.');
              }
            }
            console.log('endDynamicRental: Corrected the payment of user', activeRental.getDataValue('userId') + '.');
          } catch (error) {
            console.log('endDynamicRental: Correcting the payment of user', activeRental.getDataValue('userId') + ' failed.');
            console.error('endDynamicRental:', error);

            /* If the payment correction failed, set the paymentOffset to the remaining amount the user has to pay or has overpaid */
            const paymentOffset = parseFloat((payment.currentAmountPaid - payment.targetAmountPaid).toFixed(2));
            payment.paymentOffset = paymentOffset;

            console.log('endDynamicRental: The user', activeRental.getDataValue('userId'), 'now has a paymentOffset of', paymentOffset, '€.');
          }
        }
        /* Correct the payment if the user has paid too little. */
        if (payment.currentAmountPaid < payment.targetAmountPaid) {
          console.log('endDynamicRental: Correcting the payment of user', activeRental.getDataValue('userId'), 'for rental', activeRental.getDataValue('id') + ', because the user has paid too little...');
          try {
            /* Charge the user for the difference. */
            const amountToCharge = parseFloat((payment.targetAmountPaid - payment.currentAmountPaid).toFixed(2));
            if (amountToCharge > 0) {
              console.log('endDynamicRental: Charging ' + amountToCharge + ' €...');

              await TransactionManager.doTransaction(activeRental.getDataValue('paymentMethodId'), activeRental.getDataValue('userId'), amountToCharge, transaction);

              /* Update the currentAmountPaid to reflect the just charged amount */
              payment.currentAmountPaid = parseFloat((payment.currentAmountPaid + amountToCharge).toFixed(2));

              correctPaymentStatus.chargedRemainingAmount = true;  // Update the status

              console.log('endDynamicRental: Charged ' + amountToCharge + ' €.');
            }
            if (payment.paymentOffset !== 0 && payment.currentAmountPaid === payment.targetAmountPaid) {
              /* If paymentOffset is not 0 then we have already tried to correct the payment because
              * the user has paid too much but only the last paid block could be refunded while charging the
              * user for the actual time used failed. Refunding of the last paid block but not charging the remaining amount
              * also lead us into this if block (where we correct the payment because the user has paid too little).
              * In this block we try again to charge the user for the remaining amount. If we reach this block here,
              * we tried again to charge the user for the remaining amount and it succeeded this time. Therefore, we
              * have to set the paymentOffset to 0 because nothing is overpaid or underpaid anymore. */
              payment.paymentOffset = 0;
            }
            console.log('endDynamicRental: Corrected the payment of user', activeRental.getDataValue('userId') + '.');
          } catch (error) {
            console.log('endDynamicRental: Correcting the payment of user', activeRental.getDataValue('userId') + ' failed.');
            console.error('endDynamicRental:', error);

            /* If the payment correction failed, set the paymentOffset to the remaining amount the user has to pay or has overpaid */
            const paymentOffset = parseFloat((payment.currentAmountPaid - payment.targetAmountPaid).toFixed(2));
            payment.paymentOffset = paymentOffset;

            console.log('endDynamicRental: The user', activeRental.getDataValue('userId'), 'now has a paymentOffset of', paymentOffset, '€.');
          }
        }

        console.log('endDynamicRental (payment after correction):', payment);

        /* Consider the paymentOffset value of the active rental before updating it */
        const oldPaymentOffset = parseFloat(parseFloat(activeRental.getDataValue('paymentOffset')).toFixed(2));
        payment.paymentOffset = parseFloat((payment.paymentOffset + oldPaymentOffset).toFixed(2));

        /* Create a new past rental entry */
        // Set the nextActionTime to the time the current time since the user has paid for the time until now
        activeRental.setDataValue('nextActionTime', currentTime);
        activeRental.setDataValue('total_price', payment.targetAmountPaid);
        activeRental.setDataValue('paymentOffset', payment.paymentOffset);
        // Not necessary to save the updated rental here, as it will be destroyed when ending the rental

        /* End the rental using the endStaticRental method (removes the rental from activeRentals and adds it
         * to pastRentals with nextActionTime as the end time of the rental) */
        const newPastRental = await RentalManager.endStaticRental(activeRental, transaction);  // By passing the activeRental object we make endStaticRental() use the newly set nextActionTime as the end time of the rental
        activeRentalIsEnded = true;

        /* Start a routine to correct the paymentOffset values of the user */
        await RentalManager.correctUnderpaidOffsetsOfUser(newPastRental.getDataValue('paymentMethodId'), newPastRental.getDataValue('userId'), transaction);

        if(!transactionExtern) await transaction.commit();

        return newPastRental;
      } catch (error) {
        console.error('endDynamicRental:', error);

        if(!transactionExtern) await transaction.rollback(); // Rollback the transaction in case of an error

        if ((correctPaymentStatus.refundedLastBlock || correctPaymentStatus.chargedRemainingAmount) && !activeRentalIsEnded) {
          throw new CustomError(errorMessages.ERROR_ENDING_RENTAL, { rentalId: activeRental.getDataValue('id'), currentAmountPaid: payment.currentAmountPaid, targetAmountPaid: payment.targetAmountPaid, paymentOffset: payment.paymentOffset });
        }

        if ((!correctPaymentStatus.refundedLastBlock && !correctPaymentStatus.chargedRemainingAmount) && !activeRentalIsEnded) {
          throw new CustomError(errorMessages.ERROR_ENDING_RENTAL, { rentalId: activeRental.getDataValue('id'), currentAmountPaid: payment.currentAmountPaid, targetAmountPaid: payment.targetAmountPaid, paymentOffset: payment.paymentOffset });
        }

        /* Handle errors that can occur during correcting paymentOffset values or when the rental was already ended.
         * That are especially errors after payment activities that must be handled by the controller after rolling back the transaction. */
        if (error.message === errorMessages.CHARGE_OFFSET_ROLLBACK_PAYMENT_FAILED || activeRentalIsEnded) {
          console.error('endDynamicRental: Could not correct the payment after the rental', activeRental.getDataValue('id'), 'was already ended.');
          
          if (error.message === errorMessages.CHARGE_OFFSET_ROLLBACK_PAYMENT_FAILED) {
            throw new CustomError(errorMessages.ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED, { rentalId: activeRental.getDataValue('id'), chargedAmount: error.payload.chargedAmount });
          } else {
            throw new CustomError(errorMessages.ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED, { rentalId: activeRental.getDataValue('id') });
          } 
        }

        /* Handle severe errors that can occur after payment activities and when the rental was already ended. */
        if (correctPaymentStatus.refundedLastBlock || correctPaymentStatus.chargedRemainingAmount) {
          throw new Error(errorMessages.SEVERE_ERROR_ENDING_RENTAL);
        }

        throw new Error(error.message);
      }
    }

    public static async endStaticRental(activeRental: Model, transaction?: Transaction): Promise<Model> {
      const transactionExtern: boolean = transaction !== undefined;
      if(!transactionExtern) transaction = await database.getSequelize().transaction();

      try {
          /* Create a past rental entry with the total price */
          const newEndDate = new Date(activeRental.dataValues.nextActionTime);
          const price_per_hour = parseFloat(activeRental.dataValues.price_per_hour);
          const total_price = parseFloat(activeRental.dataValues.total_price);
          const paymentOffset = parseFloat(activeRental.dataValues.paymentOffset);
          const newPastRental = await PastRental.create({ id: activeRental.dataValues.id, endedAt: newEndDate, price_per_hour: price_per_hour, total_price: total_price, userId: activeRental.dataValues.userId, scooterId: activeRental.dataValues.scooterId, paymentMethodId: activeRental.dataValues.paymentMethodId, createdAt: new Date(activeRental.dataValues.createdAt), paymentOffset: paymentOffset }, { transaction: transaction }); // move rental to the past rentals

          /* End the active rental */
          await activeRental.destroy({ transaction: transaction });

          if(!transactionExtern) await transaction.commit();

          return newPastRental;
      } catch (error) {
          console.error(error);
          if(!transactionExtern) await transaction.rollback();
          throw new Error(errorMessages.END_STATIC_RENTAL_FAILED);
      }
    }

    public static async endRental(rentalId: number, transaction?: Transaction, activeRental?: Model): Promise<Model> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            /* Fetch the activeRental if it wasn't provided */
            if (!activeRental) {
              activeRental = await ActiveRental.findByPk(rentalId, { transaction: transaction });
            }
            if(!activeRental) {
              if(!transactionExtern) await transaction.commit();
              return; // do nothing if no rental found
            }
            
            /* End the rental depending on whether it is dynamic or prepaid */
            let newPastRental: Model;
            if(activeRental.dataValues.renew) {
              newPastRental = await RentalManager.endDynamicRental(activeRental, transaction);
            } else {
              newPastRental = await RentalManager.endStaticRental(activeRental, transaction);
            }

            if(!transactionExtern) await transaction.commit();

            return newPastRental;
        } catch (error) {
            console.error(error);
            if(!transactionExtern) await transaction.rollback();
            throw error;
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
        console.log(`checkRental: checking rental ${rentalId}`);
        const transaction = await database.getSequelize().transaction();
        let paymentToken: string | null = null;
        let paymentService: PaymentService | null = null;
        let rental;
        try {
            // find the rental we want to check
            rental = await ActiveRental.findByPk(rentalId, { 
              transaction: transaction,
              lock: true
            });
            if(!rental) {
              await transaction.commit();
              return; // do nothing if no rental found
            }

            if(rental.dataValues.renew) { // rental is dynamic and should be renewed
                console.log(`checkRental: renewing rental ${rentalId}`);

                /* Prepare calculations to update the database */
                const lastActionTime = new Date(rental.getDataValue('nextActionTime'));
                const nextActionTime = lastActionTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS;
                const nextBlockPrice = parseFloat((rental.getDataValue('price_per_hour') * (DYNAMIC_EXTENSION_INTERVAL_MS / (1000 * 60 * 60))).toFixed(2));
                const newTotalPrice = parseFloat((parseFloat(rental.getDataValue('total_price')) + nextBlockPrice).toFixed(2));
                
                const renewStatus = {
                  nextBlockPaid: false,
                  rentalUpdated: false
                };
                try {
                    /* Pay for the next block */
                    console.log(`checkRental: Charging ${nextBlockPrice} € for the next block of rental ${rentalId}...`);
                    const paymentTransaction = await TransactionManager.doTransaction(rental.getDataValue('paymentMethodId'), rental.getDataValue('userId'), nextBlockPrice, transaction); // try pay for next block
                    if (!paymentTransaction || !paymentTransaction.token || paymentTransaction.token === '' || !paymentTransaction.serviceUsed) {
                      throw new Error(errorMessages.PAYMENT_FAILED);
                    }
                    paymentToken = paymentTransaction.token;
                    paymentService = paymentTransaction.serviceUsed;
                    renewStatus.nextBlockPaid = true;
                    console.log(`checkRental: Charged ${nextBlockPrice} €.`);

                    /* Update the active rental in the database */
                    rental.setDataValue('nextActionTime', new Date(nextActionTime));
                    rental.setDataValue('total_price', newTotalPrice);
                    rental.setDataValue('lastPaymentToken', paymentTransaction.token);

                    /* Save the changes to the database */
                    await rental.save({ transaction: transaction });
                    renewStatus.rentalUpdated = true;

                    /* Schedule the next check */
                    RentalManager.scheduleRentalCheck(rentalId, new Date(nextActionTime));
                } catch (error) { // cancel if unable
                    console.log(`checkRental: Could not extend rental ${rental.dataValues.id}\n${error}`);
                    if (!renewStatus.nextBlockPaid && !renewStatus.rentalUpdated) {
                      console.log('checkRental: Charging the next block of', rentalId, 'failed.');
                    }

                    if (renewStatus.nextBlockPaid && !renewStatus.rentalUpdated) {
                      console.log('checkRental: Rolling back payment for rental', rentalId);
                      try {
                        await TransactionManager.rollbackTransaction(paymentService, paymentToken);
                        console.log('checkRental: Rolled back payment for rental', rentalId);
                      } catch (error) {
                        console.log('checkRental:', error);
                        console.error('WARNING: Could not rollback the payment for rental ' + rentalId + ' after payment activity. Please check the database for inconsistencies.');
                      }
                    }

                    await RentalManager.endRental(rentalId, transaction);
                }
            }
            else { // rental is prepaid and should be ended
                console.log(`checkRental: Ending static rental ${rentalId}`);
                await RentalManager.endRental(rentalId, transaction);
            }

            await transaction.commit();
        } catch (error) {
            console.log('checkRental:', error);

            await transaction.rollback();
            
            console.log(`checkRental: Rolled back transaction for rental ${rentalId}.`);

            if (error.message === errorMessages.ERROR_ENDING_RENTAL) {
              try {
                rental.setDataValue('total_price', error.payload.targetAmountPaid); 
                rental.setDataValue('paymentOffset', error.payload.paymentOffset); 
                rental.setDataValue('renew', false);  // Set renew to false to prevent the rental from being extended or canceled by user again
                await rental.save(); // Save the updated rental in case the transaction was rolled back, no transaction is used here because the transaction was already rolled back
                const currentTime = new Date();
                RentalManager.scheduleRentalCheck(rental.getDataValue('id'), new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
                return;
              } catch (error) {
                /* Note: If the rental could not be saved after the payment activity, we have data inconsistency.
                 *        Normally would try to log this and inform the admin at this point, but for simplicity
                 *        (in the context of this project) we simply return an error message to the user and print
                 *        a statement to the console. */
                console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after possible payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
                return;
              }
            }

            if (error.message === errorMessages.SEVERE_ERROR_ENDING_RENTAL) {
              console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
              return;
            }

            if (error.message === errorMessages.ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED) {
              try {
                if (error.payload.chargedAmount) {
                  const currentPaymentOffset = parseFloat(parseFloat(rental.getDataValue('paymentOffset')).toFixed(2));
                  rental.setDataValue('paymentOffset', parseFloat((currentPaymentOffset + error.payload.chargedAmount).toFixed(2)));
                }
                rental.setDataValue('renew', false);  // Set renew to false to prevent the rental from being extended or canceled by user again
                await rental.save(); // Save the updated rental in case the transaction was rolled back, no transaction is used here because the transaction was already rolled back
                const currentTime = new Date();
                RentalManager.scheduleRentalCheck(rental.getDataValue('id'), new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
                console.log('checkRental: Database transaction got rolled back. But could reflect already processed payment activity to the database. Try to end active rental', rental.getDataValue('id'), 'again later.');
                return;
              } catch (error) {
                /* Note: If the rental could not be saved after the payment activity, we have data inconsistency.
                 *       Normally would try to log this and inform the admin at this point, but for simplicity
                 *       (in the context of this project) we simply return an error message to the user and print
                 *       a statement to the console. */
                console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
                return;
              }
            }
            
            console.log(`checkRental: Check on rental ${rentalId} failed!\n${error}`);
        }
    }

    /**
     * Merges/Offsets the paymentOffset values of all rentals for a given user.
     * This method is offsetting/merging the paymentOffset values of the oldest pastRentals first.
     * 
     * Explanation of the paymentOffset values:
     * If paymentOffset > 0, the user has paid too much (overpaid).
     * If paymentOffset < 0, the user has paid too little (underpaid).
     * If paymentOffset = 0, the user has paid exactly the correct amount.
     * 
     * @param userId The ID of the user whose paymentOffset values are to be merged.
     * @param transaction The database transaction to use for the charging process (optional).
     * @returns The total paymentOffset value of the user after merging all paymentOffset values.
     */
    public static async mergeOffsetAmountsOfUser(userId: number, transaction?: Transaction): Promise<number> {
      const transactionExtern: boolean = transaction !== undefined;
      if(!transactionExtern) transaction = await database.getSequelize().transaction();
        
      try {
        console.log('mergeOffsetAmountsOfUser: Merging the paymentOffset values of user', userId + '...');
        const pastRentals = await PastRental.findAll({
          where: {
            userId: userId,
            paymentOffset: {
              [Op.ne]: 0 // Not equal operator
            }
          },
          attributes: ['id', 'paymentOffset', 'endedAt'],
          order: [['endedAt', 'ASC']], // order by endedAt to correct the oldest offsets first
          transaction: transaction
        });

        /* If there are no past rentals with overpaid or underpaid paymentOffset values, return 0 */
        if (pastRentals.length === 0) {
          console.log('mergeOffsetAmountsOfUser: Nothing to merge. The user', userId, 'has no overpaid or underpaid offsets.');
          if(!transactionExtern) await transaction.commit();
          return 0;
        }
  
        let rentalChanged = false;
        /* Go through all past rentals with positive paymentOffset values */
        for (let i = 0; i < pastRentals.length; i++) {
          /* Only do something if the paymentOffset value is positive  */
          if (parseFloat(parseFloat(pastRentals[i].dataValues.paymentOffset).toFixed(2)) > 0) {
            let positiveOffset = parseFloat(parseFloat(pastRentals[i].dataValues.paymentOffset).toFixed(2));
            /* Go through all past rentals with negative offsets to offset the current positive paymentOffset value */
            for (let j = 0; j < pastRentals.length; j++) {
              /* Only do something if the paymentOffset value is negative */
              if (parseFloat(parseFloat(pastRentals[j].dataValues.paymentOffset).toFixed(2)) < 0) {
                /* Calculate the amount that can be offset from the negative offset */
                const amountToOffset = Math.min(positiveOffset, parseFloat((-parseFloat(parseFloat((pastRentals[j].dataValues.paymentOffset)).toFixed(2))).toFixed(2)));  // Math.min to not offset more than the negative offset
                /* Update the new positive offset value and the new negative offset value */
                positiveOffset  = parseFloat((positiveOffset - amountToOffset).toFixed(2)); // Subtract the amount that was offset from the positive offset we are currently looking at
                pastRentals[j].setDataValue('paymentOffset', parseFloat((parseFloat(parseFloat(pastRentals[j].dataValues.paymentOffset).toFixed(2)) + amountToOffset).toFixed(2))); // Update the negative offset with the amount that was corrected
                rentalChanged = true;
  
                /* If the positive offset has been offset completely, break the loop */
                if (positiveOffset === 0) {
                  break;
                }
              }
            }
  
            // Update the positive offset rental if it has been changed (offsetted with negative offsets)
            if (positiveOffset !== parseFloat(parseFloat(pastRentals[i].dataValues.paymentOffset).toFixed(2))) {
              pastRentals[i].setDataValue('paymentOffset', parseFloat(positiveOffset.toFixed(2)));
              rentalChanged = true;
            }
          }
        }
  
        /* Sum up over all offsets to be able to return the total Offset of the user */
        let totalOffset = 0;
        for (let i = 0; i < pastRentals.length; i++) {
          totalOffset = parseFloat((totalOffset + parseFloat((parseFloat(pastRentals[i].dataValues.paymentOffset)).toFixed(2))).toFixed(2));
        }
  
        /* Save all the changes to the database */
        if (rentalChanged) {
          const savePromises = pastRentals.map(async rental => {
            await rental.save({ transaction: transaction });
          });
          await Promise.all(savePromises);
        }

        if(!transactionExtern) await transaction.commit();

        console.log('mergeOffsetAmountsOfUser: Successfully merged the paymentOffset values of user', userId + '. The user now has a total paymentOffset value of', totalOffset, '€.');
  
        return totalOffset;
      } catch (error) {
        console.error('mergeOffsetAmountsOfUser:', error);
        if(!transactionExtern) await transaction.rollback();
        throw new Error(errorMessages.MERGE_PAYMENT_OFFSETS_FAILED);
      }
    }

    /**
     * This method sets the paymentOffset values of a user back to 0 after charging or crediting the user for his total paymentOffset value.
     * 
     * @param userId The ID of the user whose underpaid offsets are to be corrected.
     * @param amount The amount that was charged or credited to the user to correct the total paymentOffset of the user.
     * 
     * If amount > 0, the user was charged with the amount.
     * If amount < 0, the user was credited with the amount.
     * If amount = 0, nothing was charged or credited to the user.
     * 
     * @param transaction The database transaction to use for the charging process (optional).
     */
    public static async clearPaymentOffsetsOfUser(userId: number, amount: number, transaction: Transaction): Promise<void> {
      if (amount === 0) {
        /* If the amount is 0, there is nothing to do */
        return;
      }

      try {
        /* If the charge was successful, update the paymentOffset values of the user in the database */
        const pastRentals = await PastRental.findAll({
          where: {
            userId: userId,
            paymentOffset: {
              [Op.ne]: 0 // Not equal operator
            }
          },
          transaction: transaction
        });

        /* Update each rental's paymentOffset value to 0 and check if the sum of the paymentOffset values is equal to the amount that was charged. */
        let checkSum = amount;
        const savePromises = pastRentals.map(async rental => {
          const currentOffset = parseFloat(parseFloat(rental.getDataValue('paymentOffset')).toFixed(2));
          checkSum = parseFloat((checkSum + currentOffset).toFixed(2)); // Use add here because the paymentOffset is negative so it actually gets subtracted from the checkSum which is the positive chargedAmount
          rental.setDataValue('paymentOffset', 0);
          await rental.save({ transaction: transaction });
        });
        await Promise.all(savePromises);

        /* If the sum of the paymentOffset values is not equal to the amount that was charged, throw an error */
        if (checkSum !== 0) {
          throw new Error(errorMessages.CLEARING_CHECKSUM_WRONG);
        }

        return;
      } catch (error) {
        console.error('clearPaymentOffsetsOfUser:', error);
        throw new Error(errorMessages.CLEAR_PAYMENT_OFFSETS_FAILED);
      }
    }

    /**
     * Charges the underpaid offsets (negative paymentOffset values) of a user by charging the
     * underpaid offsets with a payment method.
     * 
     * Explanation of the paymentOffset values:
     * If paymentOffset > 0, the user has paid too much (overpaid).
     * If paymentOffset < 0, the user has paid too little (underpaid).
     * If paymentOffset = 0, the user has paid exactly the correct amount.
     * 
     * @param userId The ID of the user whose paymentOffset values are to be merged.
     * @param paymentMethodId The ID of the payment method to charge the underpaid offsets with.
     * @param transaction The database transaction to use for the charging process (optional).
     * @returns The total paymentOffset value of the user (0 if all underpaid offsets were charged, >0 if the user has overpaid offset values, that will be offset with the user's next purchase).
     */
    public static async chargeUnderpaidOffsetOfUser(userId: number, paymentMethodId: number, transaction?: Transaction): Promise<number> {
      const transactionExtern: boolean = transaction !== undefined;
      if(!transactionExtern) transaction = await database.getSequelize().transaction();

      let paymentToken: string | null = null;
      let paymentService: PaymentService | null = null;
      let chargedAmount = 0;

      try {
        /* Merge the paymentOffset values of the user */
        const amountToCharge = await RentalManager.mergeOffsetAmountsOfUser(userId, transaction);
        
        console.log('chargeUnderpaidOffsetOfUser: Charging the user', userId, 'for the underpaid offsets of', -amountToCharge, '€...');

        /* If there is no underpaid offset to charge, don't charge something */
        if (amountToCharge >= 0) {
          console.log('chargeUnderpaidOffsetOfUser: Nothing to charge. The user', userId, 'is overpaid with', amountToCharge, '€.');
          if(!transactionExtern) await transaction.commit();
          return amountToCharge;  // amountToCharge is then actually no underpaid (negative) offset but a overpaid (positive) offset
        }
        
        /* Charge the user's payment method with the amount that needs to be charged */
        const transactionInfo = await TransactionManager.doTransaction(paymentMethodId, userId, -amountToCharge, transaction);
        chargedAmount = -amountToCharge;  // Make the charged amount positive because it is now used as a charged amount and not as an underpaid amount anymore.
        console.log('chargeUnderpaidOffsetOfUser: Successfully charged the user', userId, 'an amount of', chargedAmount, '€.');

        /* Save the paymentToken and paymentService in case we need to rollback the transaction */
        paymentToken = transactionInfo.token;
        paymentService = transactionInfo.serviceUsed;

        /* If the charge was successful, update the paymentOffset values of the user in the database */
        await RentalManager.clearPaymentOffsetsOfUser(userId, chargedAmount, transaction);

        if(!transactionExtern) await transaction.commit();

        return 0;
      } catch (error) {
        console.error('chargeUnderpaidOffsetOfUser:', error);

        if(!transactionExtern) await transaction.rollback();

        /* Rollback the payment if the booking failed and the payment was already processed */
        if (paymentService && paymentToken) {
          try {
            console.log('chargeUnderpaidOffsetOfUser: Rolling back the payment of the user', userId, 'for an amount of', chargedAmount, '€...');
            await TransactionManager.rollbackTransaction(paymentService, paymentToken);
            console.log('chargeUnderpaidOffsetOfUser: Successfully rolled back the payment of the user', userId, 'for an amount of', chargedAmount, '€.');
          } catch (error) {

            if (!transactionExtern) {
              console.log('chargeUnderpaidOffsetOfUser: Rolling back failed! Try to reflect the amount of', chargedAmount, '€ to the database that we charged user', userId + '.');
              /* Try to reflect the charged amount to the database before throwing the error */

              /* Create a new transaction for the rollback because the original transaction is already going to be rolled back.
              * But send the original transaction to it so that sequalize treats it as savepoint (i.e. changes within won't be rolled back). */
              const rollbackTransaction = await database.getSequelize().transaction();
              try {
                if (chargedAmount !== 0) {
                  const latestRental = await PastRental.findOne({
                    where: {
                      userId: userId
                    },
                    order: [['endedAt', 'DESC']],  // We want to reflect the charged amount to the latest rental
                    limit: 1,
                    transaction: rollbackTransaction
                  });
                  const currentPaymentOffset = parseFloat(parseFloat(latestRental.getDataValue('paymentOffset')).toFixed(2));
                  latestRental.setDataValue('paymentOffset', parseFloat((currentPaymentOffset + chargedAmount).toFixed(2)));
                  console.log('chargedAmount:', chargedAmount, 'currentPaymentOffset:', currentPaymentOffset, 'newPaymentOffset:', parseFloat((currentPaymentOffset + chargedAmount).toFixed(2)));
                  await latestRental.save({ transaction: rollbackTransaction });
                  await rollbackTransaction.commit();
                  console.log('chargeUnderpaidOffsetOfUser: Saved the charged amount of', chargedAmount, '€ to the payment offset of the latest rental of the user', userId, 'for the charged amount of', chargedAmount, '€ that we could not rollback.');
                }
              } catch (error) {
                console.error('chargeUnderpaidOffsetOfUser: Could not reflect the charged amount of', chargedAmount, '€ to the database.');
                console.error('chargeUnderpaidOffsetOfUser:', error);
                await rollbackTransaction.rollback();
                throw new Error(errorMessages.ROLLBACK_PAYMENT_FAILED);
              }
            } else {
              console.log('chargeUnderpaidOffsetOfUser: Rolling back failed! Try to propagate the already charged amount of', chargedAmount, '€ to the initiator of the transaction so that he can reflect the already charged amount to the database after rollback.');
              throw new CustomError(errorMessages.CHARGE_OFFSET_ROLLBACK_PAYMENT_FAILED, { chargedAmount: chargedAmount });
            }
          }
        }

        throw new Error(errorMessages.CORRECT_UNDERPAID_OFFSETS_FAILED);
      }
      
    }

    public static scheduleChargeUnderpaidOffset(paymentMethodId: number, userId: number, time: Date): void {
      if (time.getTime() < Date.now()) {
        return; // don't schedule if time is in the past
      }

      console.log(`scheduleJob: Scheduling correctUnderpaidOffsetsOfUser at ${time}.`);
      scheduleJob(`chargeUnderpaidOffsets${time}`, time, async () => {
        try {
          await RentalManager.correctUnderpaidOffsetsOfUser(paymentMethodId, userId);
        } catch (error) {
          console.log('scheduleChargeUnderpaidOffset: Could not correct the paymentOffset values of user', userId + '.');
          console.error('scheduleChargeUnderpaidOffset:', error);
        }
      });
    }

    /* With this method, all outstanding amounts of a user are not only collected but also offset by positive counter amounts (credits). */
    public static async correctUnderpaidOffsetsOfUser(paymentMethodId: number, userId: number, transaction?: Transaction): Promise<void> {
      try {
        console.log('correctUnderpaidOffsetsOfUser: Correcting paymentOffset values of user', userId + '...');
        let correctedPaymentOffset;
        if (transaction) {
          correctedPaymentOffset = await RentalManager.chargeUnderpaidOffsetOfUser(userId, paymentMethodId, transaction);
        } else {
          correctedPaymentOffset = await RentalManager.chargeUnderpaidOffsetOfUser(userId, paymentMethodId);
        }
        console.log('correctUnderpaidOffsetsOfUser: Successfully corrected paymentOffset values of user', userId + '. Now, we owe the user', correctedPaymentOffset, '€.');
        return;
      } catch (error) {
        console.log('correctUnderpaidOffsetsOfUser:', error);
        
        if (error.message === errorMessages.ROLLBACK_PAYMENT_FAILED) {
          /* Note: If the rollback after a payment fails, we have charged the user for something that is
           *       not reflected to our database. So it can happen that we charge the user again for the same.
           *       Normally would try to log this and inform the admin and user (e.g. via E-Mail) at this point,
           *       but for simplicity (in the context of this project) we simply print a statement to the console. */
          console.error('WARNING: Could not rollback payment after charging underpaid paymentOffset values of user ' + userId + ' with payment method ' + paymentMethodId + '. The user may be charged again for the same. Please compare the database with the payment provider.');
        } else {
          console.error('correctUnderpaidOffsetsOfUser: Could not charge underpaid paymentOffset values of user', userId + '.');
        }
        console.log('correctUnderpaidOffsetsOfUser: Try to charge underpaid paymentOffset values of user', userId, 'again in', (DYNAMIC_EXTENSION_INTERVAL_MS / 60000), 'minutes.');
        RentalManager.scheduleChargeUnderpaidOffset(paymentMethodId, userId, new Date((new Date().getTime() + DYNAMIC_EXTENSION_INTERVAL_MS)));
        throw error;
      }
    }

    public static async correctUnderpaidOffsetsOfAllUsers(): Promise<void> {
      /* Find all userIds with underpaid/overpaid offsets. */
      const usersWithUnderpaidOffsets = await PastRental.findAll({
        attributes: [
          'userId',
          [Sequelize.fn('SUM', Sequelize.col('paymentOffset')), 'totalPaymentOffset']
        ],
        where: {
          paymentOffset: { [Op.ne]: 0 }  // Not equal operator
        },
        group: ['userId']
      });

      /* For each found user, exctract the most recenttly used paymentMethodId. */
      for (const user of usersWithUnderpaidOffsets) {
        const latestRental = await PastRental.findOne({
          where: {
            userId: user.getDataValue('userId')
          },
          order: [['endedAt', 'DESC']],
          limit: 1
        });

        /* If the user has such a latest rental, correct the paymentOffset values of the user. */
        if (latestRental) {
          console.log('correctUnderpaidOffsetsOfAllUsers: Correcting paymentOffset value', user.getDataValue('totalPaymentOffset'), 'of user', user.getDataValue('userId'), 'with payment method', latestRental.getDataValue('paymentMethodId') + '.');
          await RentalManager.correctUnderpaidOffsetsOfUser(latestRental.getDataValue('paymentMethodId'), user.getDataValue('userId'));
          console.log('correctUnderpaidOffsetsOfAllUsers: Successfully corrected paymentOffset value of user', user.getDataValue('userId') + '.');
        }
      }
    }
}

export default RentalManager;
