import { Request, Response } from 'express';
import { Rental } from '../models/rental';
import database from '../database';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';

export class BookingController{
    /* Method that returns all entries from the Rentals table for a specific User_Id */
    public async getUserRentals(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        try {
            const rentals = await Rental.findAll({ where: { user_id: userId } });

            if (rentals.length === 0) {
                response.status(404).json({ code: 404, message: 'Keine Mietverträge gefunden.' });
                return;
            }

            response.status(200).json(rentals);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Mietverträge.' });
        }
    }

    // start renting a given scooterId, if it's free
    public async startRental(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId;
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        const scooterId = request.body.scooterId;
        if(!scooterId) {
            response.status(401).json({ code: 401, message: 'Kein Scooter angegeben.' });
            return;
        }

        // make sure the wanted scooter is free
        const scooter = await Scooter.findOne({where: {id: scooterId, active_rental_id: null}});
        if(!scooter) {
            response.status(401).json({code: 401, message: 'Angegebener Scooter ist nicht verfuegbar'});
            return;
        }

        // book the scooter
        const transaction = await database.getSequelize().transaction();
        try {
            const rental = await Rental.create({id: 0, scooter_id: scooterId, user_id: userId}, {transaction: transaction});
            await Scooter.update({'active_rental_id': rental.dataValues.id }, {where: {id: scooterId}, transaction: transaction});
            await transaction.commit();
        } catch (error) {
            transaction.rollback();
            response.status(500).json({ code: 500, message: 'Fehler bei der Buchung.' });
            return;
        }

        response.status(201).json({code: 201, message: 'Erfolgreiche Buchung.'});
    }

    public async endRental(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId;
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        const rentalId = request.body.rentalId;
        if(!rentalId) {
            response.status(401).json({ code: 401, message: 'Keine Buchung angegeben.' });
            return;
        }

        const paymentMethod = request.body.paymentMethod;
        if(!paymentMethod) {
            response.status(401).json({ code: 401, message: 'Keine Zahlungsmethode angegeben.' });
            return;
        }

        // find the rental and end it
        const rental = await Rental.findOne({where: {id: rentalId}});
        if(!rental) {
            response.status(401).json({code: 401, message: 'Angegebene Buchung existiert nicht.'});
            return;
        }
        if(rental.getDataValue('endedAt')) {
            response.status(401).json({code: 401, message: 'Angegebene Buchung wurde schon beendet'});
            return;
        }
        rental.setDataValue('endedAt', Date.now()); // set rental end time

        // find the scooter associated with the rental and free it
        const scooter = await Scooter.findOne({where: {active_rental_id: rental.dataValues.id}});
        if(!scooter) {
            response.status(500).json({code: 500, message: 'Buchung konnte nicht beendet werden'});
            return;
        }
        const transaction = await database.getSequelize().transaction();
        try {
            await Scooter.update({'active_rental_id': null}, {where: {id: scooter.dataValues.id}, transaction: transaction});
        } catch (error) {
            response.status(500).json({code: 500, message: 'Buchung konnte nicht beendet werden'});
            transaction.rollback();
            return;
        }

        // calculate rental price
        const product = await Product.findOne({where: {name: scooter.dataValues.product_id}});
        const price = ((rental.dataValues.endedAt - rental.dataValues.createdAt) / 1000 / 60 / 60) * product.dataValues.price_per_hour; // time in milliseconds! hence the conversion

        // TODO: actually make use of the payment method

        response.status(200).json({code: 200, message: 'Successfully ended rental.', price: price});
    }
}