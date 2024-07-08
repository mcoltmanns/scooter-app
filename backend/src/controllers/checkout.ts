import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import Database from '../database';
import { Product } from '../models/product';
import { Model } from 'sequelize';
import RentalManager from '../services/rental-manager';
import { TransactionManager } from '../services/payment/transaction-manager';
import { PaymentService } from '../interfaces/payment-service.interface';
import { DYNAMIC_EXTENSION_INTERVAL_MS, PREPAID_RENTAL_DISCOUNT } from '../static-data/global-variables';
import { errorMessages } from '../static-data/error-messages';

interface ProductInstance extends Model {
  price_per_hour: number;
}

interface ScooterInstance extends Model {
  product: ProductInstance;
}

/* Processes the payment and also books the scooter in our database */
export class CheckoutController {
  public async processCheckout(request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;

    const { scooterId, paymentMethodId, duration } = request.body;

    const isDynamic = !duration; // If no duration is provided, a checkout for a dynamic rental is requested
    
    let rentalDuration;
    if (isDynamic) {
      rentalDuration = DYNAMIC_EXTENSION_INTERVAL_MS;
    } else {
      // rentalDuration = duration * 60 * 60 * 1000; // Convert hours to milliseconds
      rentalDuration = 80000; // For testing/debugging purposes, set the duration to 40 seconds
    }

    let rental: Model | null = null;

    let endTimestamp;

    let paymentToken: string | null = null;
    let paymentService: PaymentService | null = null;

    /* Start a transaction to solve multiple db queries at once and protect against the problem of partial success */
    const transaction = await Database.getSequelize().transaction();

    try {
      const scooter = await Scooter.findByPk(scooterId, { 
        include: [{
          model: Product,
          attributes: ['price_per_hour']
        }],
        transaction 
      }) as ScooterInstance; // figure out our scooter and model

      /* Calculate the total price */
      let pricePerHour = scooter.product.price_per_hour;
      if (!isDynamic) {
        pricePerHour = parseFloat(((pricePerHour/100)*(100-PREPAID_RENTAL_DISCOUNT)).toFixed(2)); // Consider the discount for prepaid rentals
      }
      const totalPrice = parseFloat((pricePerHour * (rentalDuration / (1000 * 60 * 60))).toFixed(2));  // Price for now always in €, convert milliseconds to hours

      /* Offset the paymentOffset values of the user with the total price */
      const totalOffset = await RentalManager.mergeOffsetAmountsOfUser(userId, transaction);
      let newTotalOffset = totalOffset;
      let totalPriceToCharge = totalPrice;
      /* Check if the user ows us money */
      if (totalOffset < 0) {
        const newTotalPrice = parseFloat((totalPrice - totalOffset).toFixed(2));
        console.log('processCheckout (Controller): User owes us:', -totalOffset, '€. We add this to the total price. New total price:', totalPrice, '+', -totalOffset, '=', newTotalPrice, '€');
        totalPriceToCharge = newTotalPrice;
        /* Reduce the total offset to 0 */
        newTotalOffset = 0;
        console.log('processCheckout (Controller): Total offset of the user is now', newTotalOffset, '€.');
      }
      /* Check if we owe the user money */
      if (totalOffset > 0) {
        const newTotalPrice = parseFloat((totalPrice - totalOffset).toFixed(2));
        console.log(newTotalPrice);
        console.log('processCheckout (Controller): We owe the user:', totalOffset, '€. We subtract this from the total price. New total price:', totalPrice, '-', totalOffset, '=', newTotalPrice, '€');
        /* Ensure the total price is not negative */
        if (newTotalPrice < 0) {
          totalPriceToCharge = 0;
          console.log('processCheckout (Controller): The total price is negative. We set it to', totalPriceToCharge, '€.');
          /* Reduce the total offset of the user by the total price */
          newTotalOffset = parseFloat((totalOffset - totalPrice).toFixed(2));
          console.log('processCheckout (Controller): Total offset of the user is now:', newTotalOffset, '€.');
        } else {
          totalPriceToCharge = newTotalPrice;
          /* Reduce the total offset of the user to 0 */
          newTotalOffset = 0;
          console.log('processCheckout (Controller): Total offset of the user is now', newTotalOffset, '€.');
        }
      }

      /* Process the payment transaction */
      let paymentTokenToSave;
      if (totalPriceToCharge > 0) {
        const transactionInfo = await TransactionManager.doTransaction(paymentMethodId, userId, totalPriceToCharge, transaction);   // Save the payment token in case we need to rollback the transaction
        paymentToken = transactionInfo.token;
        paymentService = transactionInfo.serviceUsed;

        /* If it is a dynamic rental and we have offset the total price with the total paymentOffset value of the user,
         * we set the paymentToken to null so that when ending the rental, the payment will not be rolled back because
         * the endDynamicRental procedure will assume that the paymentToken was for the last paid block of the dynamic rental.
         * But it would not be only the last paid block, because we have offset the total price with the total paymentOffset value of the user. */
        if (isDynamic && (totalPriceToCharge !== totalPrice)) {
          paymentTokenToSave = 'null';
        } else {
          paymentTokenToSave = paymentToken;
        }
      } else {
        paymentTokenToSave = 'null';
      }
      /* If we reach this point, the payment was successful */

      /* Start the rental */
      rental = await RentalManager.startRental(userId, scooterId, paymentMethodId, paymentTokenToSave, pricePerHour, totalPrice, rentalDuration, isDynamic, newTotalOffset, transaction, scooter); // ask the rental manager for a rental - check scooter existance and availability, update scooter, reservation, and rental tables
      // also ends associated reservation, if there was one

      /* Clear the paymentOffset values of the user in the database */
      await RentalManager.clearPaymentOffsetsOfUser(userId, -totalOffset, transaction);

      endTimestamp = rental.getDataValue('nextActionTime');  // Get the end timestamp of the rental to return it to the user
      // console.log(new Date(rental.getDataValue('nextActionTime')).toString());

      await transaction.commit();
    } catch (error) {
      console.error(error);

      await transaction.rollback(); // Rollback the transaction in case of an error

      /* Rollback the payment if the booking failed and the payment was already processed */
      if (paymentService && paymentToken) {
        try {
          await TransactionManager.rollbackTransaction(paymentService, paymentToken);
        } catch (error) {
          response.status(500).json({ code: 500, message: 'Bei der Buchung des Scooters ist ein Fehler aufgetreten. Die Zahlung konnte nicht rückgängig gemacht werden. Bitte kontaktieren Sie den Support.'});
          return;
        }
      }

      /* Handle thrown errors and translate the error messages to a more user-friendly format */
      if (error.message === errorMessages.SCOOTER_UNAVAILABLE) {
        response.status(400).json({code: 400, message: 'Der Scooter ist nicht mehr verfügbar.' });
        return;
      }
      if (error.message === errorMessages.SCOOTER_NOT_FOUND) {
        response.status(404).json({code: 404, message: 'Der Scooter existiert nicht.' });
        return;
      }
      if (error.message === errorMessages.PAYMENT_SERVICE_NOT_FOUND) {
        response.status(404).json({code: 404, message: 'Der Zahlungsanbieter existiert nicht.' });
        return;
      }
      if (error.message === errorMessages.PAYMENT_METHOD_NOT_FOUND) {
        response.status(404).json({ code: 404, message: 'Die angegebene Zahlungsmethode existiert nicht.' });
        return;
      }
      if (error.message === errorMessages.PAYMENT_FAILED) {
        response.status(500).json({ code: 500, message: 'Die Zahlung konnte nicht durchgeführt werden.'});
        return;
      }

      response.status(500).json({ code: 500, message: 'Fehler beim Buchen des Scooters.'}); // Default error message
      return;
    }

    let responseBookingObject;
    if (!isDynamic) {
      responseBookingObject = { isDynamic: false, endTimestamp: endTimestamp, rentalId: rental.getDataValue('id') };
    } else {
      responseBookingObject = { isDynamic: true, rentalId: rental.getDataValue('id') };
    }

    response.status(200).json({ code: 200, message: 'Die Buchung war erfolgreich!', booking: responseBookingObject });
    return;
  }

  public async endDynamicRental (request: Request, response: Response): Promise<void> {
    const userId = response.locals.userId;
    const { rentalId } = request.body;

    const transaction = await Database.getSequelize().transaction();

    let activeRental: Model | null = null;
    try {
      /* Fetch the active dynamic rental for the provided rentalId and ensure it belongs to the user */
      activeRental = await RentalManager.getDynamicActiveRentalByRentalIdUserId(rentalId, userId, transaction);
      if (!activeRental) {
        throw new Error(errorMessages.ACTIVE_RENTAL_NOT_FOUND);
      }

      /* End the rental */
      const newPastRental = await RentalManager.endRental(rentalId, transaction, activeRental);
      
      await transaction.commit();

      response.status(200).json({ code: 200, message: 'Die Buchung wurde erfolgreich beendet.', newPastRental: newPastRental.toJSON() });
    } catch (error) {
      console.error(error);

      console.log('endDynamicRental (Controller) before rollback:', activeRental.toJSON());

      await transaction.rollback(); // Rollback the transaction in case of an error

      /* Handle thrown errors and translate the error messages to a more user-friendly format */
      if (error.message === errorMessages.ACTIVE_RENTAL_NOT_FOUND) {
        response.status(404).json({ code: 404, message: 'Buchung nicht gefunden.' });
        return;
      }
      if (error.message === errorMessages.ERROR_ENDING_RENTAL) {
        response.status(500).json({ code: 500, message: 'Probleme beim Beenden!', hotMessage: 'Beim Beenden der Buchung ist ein Fehler aufgetreten. Wir versuchen, die Buchung zu einem späteren Zeitpunkt erneut zu beenden. Normalerweise entstehen hierdurch keine Mehrkosten. Falls du dennoch Unstimmigkeiten in deiner Abrechnung entdeckst oder die Buchungen auch in den nächsten Tagen noch nicht beendet ist, kontaktiere uns bitte unter Nennung der Buchungs-ID ' + error.payload.rentalId + '.'});
        return;
      }
      if (error.message === errorMessages.SEVERE_ERROR_ENDING_RENTAL) {
        response.status(500).json({ code: 500, message: 'Schwerwiegender Fehler!', hotMessage: 'Bei der Beendung der Buchung ist ein schwerwiegender Fehler aufgetreten, bei dem auch Zahlungsunregelmäßigkeiten aufgetreten sein können. Bitte kontaktiere uns unter Nennung der Buchungs-ID ' + error.payload.rentalId + '.'});
        return;
      }
      if (error.message === errorMessages.ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED) {
        console.log('endDynamicRental (Controller) after rollback:', activeRental.toJSON());
        try {
          if (error.payload.chargedAmount) {
            const currentPaymentOffset = parseFloat(parseFloat(activeRental.getDataValue('paymentOffset')).toFixed(2));
            activeRental.setDataValue('paymentOffset', parseFloat((currentPaymentOffset + error.payload.chargedAmount).toFixed(2)));
          }
          activeRental.setDataValue('renew', false);  // Set renew to false to prevent the rental from being extended or canceled by user again
          await activeRental.save(); // Save the updated rental in case the transaction was rolled back, no transaction is used here because the transaction was already rolled back
          const currentTime = new Date();
          RentalManager.scheduleRentalCheck(activeRental.getDataValue('id'), new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
          console.log('endDynamicRental (Controller): Database transaction got rolled back. But could reflect already processed payment activity to the database. Try to end active rental', activeRental.getDataValue('id'), 'again later.');
          console.log('endDynamicRental (Controller) after saving:', activeRental.toJSON());
          response.status(500).json({ code: 500, message: 'Probleme beim Beenden!', hotMessage: 'Beim Beenden der Buchung ist ein Fehler aufgetreten. Wir versuchen, die Buchung zu einem späteren Zeitpunkt erneut zu beenden. Normalerweise entstehen hierdurch keine Mehrkosten. Falls du dennoch Unstimmigkeiten in deiner Abrechnung entdeckst oder die Buchungen auch in den nächsten Tagen noch nicht beendet ist, kontaktiere uns bitte unter Nennung der Buchungs-ID ' + error.payload.rentalId + '.'});
          return;
        } catch (error) {
          /* Note: If the rental could not be saved after the payment activity, we have data inconsistency.
           *        Normally would try to log this and inform the admin at this point, but for simplicity
           *        (in the context of this project) we simply return an error message to the user and print
           *        a statement to the console. */
          console.error('WARNING: Could not save the updated active rental ' + activeRental.getDataValue('id') + ' after payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
          response.status(500).json({ code: 500, message: 'Schwerwiegender Fehler!', hotMessage: 'Bei der Beendung der Buchung ist ein schwerwiegender Fehler aufgetreten, bei dem auch Zahlungsunregelmäßigkeiten aufgetreten sein können. Bitte kontaktiere uns unter Nennung der Buchungs-ID ' + error.payload.rentalId + '.'});
          return;
        }
      }

      response.status(500).json({ code: 500, message: 'Fehler beim Beenden der Buchung.'}); // Default error message
      return;
    }
  }
}
