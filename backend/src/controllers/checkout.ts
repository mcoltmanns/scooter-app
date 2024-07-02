import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import Database from '../database';
import { Product } from '../models/product';
import { Model } from 'sequelize';
import RentalManager from '../services/rental-manager';
import { TransactionManager } from '../services/payment/transaction-manager';
import { PaymentService } from '../interfaces/payment-service.interface';
import { DYNAMIC_EXTENSION_INTERVAL_MS } from '../static-data/global-variables';

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
    if (!userId) {
      response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
      return;
    }

    const { scooterId, paymentMethodId, duration } = request.body;

    const isDynamic = !duration; // If no duration is provided, a checkout for a dynamic rental is requested
    
    let rentalDuration;
    if (isDynamic) {
      rentalDuration = DYNAMIC_EXTENSION_INTERVAL_MS;
    } else {
      rentalDuration = duration * 60 * 60 * 1000; // Convert hours to milliseconds
      // rentalDuration = 80000; // For testing/debugging purposes, set the duration to 40 seconds
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
      const pricePerHour = scooter.product.price_per_hour;
      const totalPrice = pricePerHour * (rentalDuration / (1000 * 60 * 60));  // Price for now always in €, convert milliseconds to hours

      /* Process the payment transaction */
      const transactionInfo = await TransactionManager.doTransaction(paymentMethodId, userId, totalPrice, transaction);   // Save the payment token in case we need to rollback the transaction
      paymentToken = transactionInfo.token;
      paymentService = transactionInfo.serviceUsed;
      /* If we reach this point, the payment was successful */

      /* Start the rental */
      rental = await RentalManager.startRental(userId, scooterId, paymentMethodId, pricePerHour, rentalDuration, isDynamic, transaction, scooter); // ask the rental manager for a rental - check scooter existance and availability, update scooter, reservation, and rental tables
      // also ends associated reservation, if there was one

      endTimestamp = rental.getDataValue('nextActionTime');  // Get the end timestamp of the rental to return it to the user
      console.log(new Date(rental.getDataValue('nextActionTime')).toString());

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
      if (error.message === 'SCOOTER_UNAVAILABLE') {
        response.status(400).json({code: 400, message: 'Der Scooter ist nicht mehr verfügbar.' });
        return;
      }
      if (error.message === 'SCOOTER_NOT_FOUND') {
        response.status(404).json({code: 404, message: 'Der Scooter existiert nicht.' });
        return;
      }
      if (error.message === 'PAYMENT_SERVICE_NOT_FOUND') {
        response.status(404).json({code: 404, message: 'Der Zahlungsanbieter existiert nicht.' });
        return;
      }
      if (error.message === 'PAYMENT_METHOD_NOT_FOUND') {
        response.status(404).json({ code: 404, message: 'Die angegebene Zahlungsmethode existiert nicht.' });
        return;
      }
      if (error.message === 'PAYMENT_FAILED') {
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

    /* Start a transaction to solve multiple db queries at once and protect against the problem of partial success */
    const transaction = await Database.getSequelize().transaction();

    try {
      /* Fetch the active rental for the provided rentalId and ensure it belongs to the user */
      const activeRental = await RentalManager.getActiveRentalByRentalIdUserId(rentalId, userId, transaction);
      if (!activeRental) {
        throw new Error('ACTIVE_RENTAL_NOT_FOUND');
      }

      /* Calculate the difference between the current time and the nextActionTime of the rental */
      const currentTime = new Date();
      const nextActionTime = new Date(activeRental.getDataValue('nextActionTime'));
      const differencePaidUsed = nextActionTime.getTime() - currentTime.getTime();

      /* Check if the user has paid more time than used */
      // We will settle the payment by refunding the old block and then making another payment from the old actionTime to currentTime.
      if (differencePaidUsed > 0) {
        console.log('User has paid more time than used. Refunding the user.');
        // TODO: Cancel/reverse the last paid time piece. The last actionTime can be calculated by subtracting the duration of the last piece (i.e. DYNAMIC_EXTENSION_INTERVAL_MS) from the nextActionTime.
        // TODO: Charge the user for the actual time used. That is, the time from the last actionTime to the current time.
      }

      /* Create a new past rental entry */
      // Set the nextActionTime to the time the current time since the user has paid for the time until now
      activeRental.setDataValue('nextActionTime', currentTime); // Not necessary to save the updated rental here, as it will be destroyed when ending the rental
      // End the rental (removes the rental from activeRentals and adds it to pastRentals with nextActionTime as the end time of the rental)
      const newPastRental = await RentalManager.endRental(activeRental.getDataValue('id'), transaction, activeRental);  // Passing the activeRental object to avoid another db query and to make endRental() use the newly set nextActionTime as the end time of the rental

      await transaction.commit();

      response.status(200).json({ code: 200, message: 'Die Buchung wurde erfolgreich beendet.', newPastRental: newPastRental.toJSON() });
      return;
    } catch (error) {
      console.error(error);

      await transaction.rollback(); // Rollback the transaction in case of an error

      /* Handle thrown errors and translate the error messages to a more user-friendly format */
      if (error.message === 'ACTIVE_RENTAL_NOT_FOUND') {
        response.status(404).json({ code: 404, message: 'Buchung nicht gefunden.' });
        return;
      }

      response.status(500).json({ code: 500, message: 'Fehler beim Beenden der Buchung.'}); // Default error message
      return;
    }
  }
}
