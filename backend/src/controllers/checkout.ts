import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import { Rental, Reservation } from '../models/rental';
import Database from '../database';
import { PaymentMethod } from '../models/payment';
import { Product } from '../models/product';
import BachelorCard from '../services/payment/bachelorcard';
import SwpSafe from '../services/payment/swpsafe';
import HciPal from '../services/payment/hcipal';
import { Model, Op } from 'sequelize';
import { BachelorCardData, PaymentService } from '../interfaces/payment-service.interface';
import { SwpSafeData } from '../interfaces/payment-service.interface';
import { HciPalData } from '../interfaces/payment-service.interface';
import ReservationManager from '../services/reservation-manager';
import RentalManager from '../services/rental-manager';

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

    const endTimestamp = new Date(Date.now() + duration * 60 * 60 * 1000); // Adding the specified number of hours in milliseconds

    const newRental = {
      endedAt: endTimestamp,
      user_id: userId,
      scooter_id: scooterId,
    };

    let paymentService: PaymentService | null = null;

    let paymentToken: string | null = null;

    /* Start a transaction to solve multiple db queries at once and protect against the problem of partial success */
    const transaction = await Database.getSequelize().transaction();

    try {
      await RentalManager.startRental(userId, scooterId, duration * 60 * 60 * 1000, transaction); // ask the rental manager for a rental - check scooter existance and availability, and sets up the transaction to update scooter, reservation, and rental tables
      // also ends associated reservation, if there was one

      const scooter = await Scooter.findByPk(scooterId, { 
        include: [{
          model: Product,
          attributes: ['price_per_hour']
        }],
        transaction 
      }) as ScooterInstance; // figure out our scooter and model

      const paymentMethod = await PaymentMethod.findOne({ 
        where: { id: paymentMethodId, usersAuthId: userId },
        transaction 
      });
      if (!paymentMethod) {
        throw new Error('PAYMENT_METHOD_NOT_FOUND');
      }

      let paymentData: BachelorCardData | SwpSafeData | HciPalData | null = null;
      /* Determine the correct payment service to process the payment */
      if (paymentMethod.get('type') === 'bachelorcard') {
        paymentService = BachelorCard as unknown as PaymentService;
        paymentData = paymentMethod.get('data') as BachelorCardData;
      }
      if (paymentMethod.get('type') === 'swpsafe') {
        paymentService = SwpSafe as unknown as PaymentService;
        paymentData = paymentMethod.get('data') as SwpSafeData;
      }
      if (paymentMethod.get('type') === 'hcipal') {
        paymentService = HciPal as unknown as PaymentService;
        paymentData = paymentMethod.get('data') as HciPalData;
      }

      if (!paymentService || !paymentData) {
        throw new Error('PAYMENT_SERVICE_NOT_FOUND');
      }

      /* Calculate the total price */
      const pricePerHour = scooter.product.price_per_hour;
      const totalPrice = pricePerHour * duration;  // For now always in €

      /* Validate the payment */
      const { status:validateStatus, message:token } = await paymentService.initTransaction(paymentData, totalPrice);

      if (validateStatus !== 200 || !token || token === '') {
        throw new Error('PAYMENT_FAILED');
      }

      /* Commit the payment */
      const commitPaymentResponse = await paymentService.commitTransaction(token);

      if (commitPaymentResponse.status !== 200) {
        throw new Error('PAYMENT_FAILED');
      }

      /* If we reach this point, the payment was successful */
      paymentToken = token;   // Save the payment token in case we need to rollback the transaction

      await transaction.commit();
    } catch (error) {
      console.error(error);

      await transaction.rollback(); // Rollback the transaction in case of an error

      /* Rollback the payment if the booking failed and the payment was already processed */
      if (paymentService && paymentToken) {
        try {
          const rollbackPaymentResponse = await paymentService.rollbackTransaction(paymentToken);
          if (rollbackPaymentResponse.status !== 200) {
            throw new Error('PAYMENT_ROLLBACK_FAILED');
          }
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

    response.status(200).json({ code: 200, message: 'Die Buchung war erfolgreich!', booking: { endTimestamp: newRental.endedAt } });
    return;
  }
}
