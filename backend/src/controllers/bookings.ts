import { Request, Response } from 'express';
import { RESERVATION_LIFETIME, Rental, Reservation } from '../models/rental';
import { Scooter } from '../models/scooter';
import Database from '../database';
import { CronJob } from 'cron';

export class BookingsController {
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

    // mark a scooter as reserved for the next 10 minutes
    public async startReservation(request: Request, response: Response): Promise<void> {
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

        const transaction = await Database.getSequelize().transaction();
        let reservationId: number;
        let expiration: Date;
        try {
            // user may only reserve if no reservations are active
            const reservations = await Reservation.findAll({ where: { user_id: userId } });
            if(reservations.length > 0) {
                response.status(401).json({ code: 401, message: 'User hat bereits eine Reservation.'});
                return;
            }

            // scooter may only be reserved if it exists and is free
            const scooter = await Scooter.findOne({ where: { id: scooterId } });
            if(!scooter) {
                response.status(404).json({ code: 404, message: 'Angegebener Scooter existiert nicht.'});
                return;
            }
            console.log(scooter.dataValues);
            if(scooter.dataValues.reservation_id !== null || scooter.dataValues.active_rental_id !== null) {
                response.status(401).json({ code: 404, message: 'Angegebener Scooter ist nicht verfuegbar.'});
                return;
            }

            // create the new reservation
            expiration = new Date(Date.now() + RESERVATION_LIFETIME);
            const newReservation = await Reservation.create({ user_id: userId, scooter_id: scooterId, endsAt: expiration }, {transaction: transaction});
            reservationId = newReservation.dataValues.id;
            // update scooters table
            scooter.setDataValue('reservation_id', newReservation.dataValues.id);
            await scooter.save({transaction: transaction});
            await transaction.commit();
            // dispatch a job to delete the reservation when it expires
            new CronJob(
                expiration,
                async () => { // on tick
                    const transaction = await Database.getSequelize().transaction();
                    try {
                        await Reservation.destroy({ where: { id: reservationId } });
                        scooter.setDataValue('reservation_id', null);
                        await scooter.save({transaction: transaction});
                        await transaction.commit();
                    } catch (error) {
                        console.error(`Could not delete reservation after expiry!\n${error})`);
                        transaction.rollback();
                    }
                },
                () => {
                    console.log('deleted expired reservation'); // on complete
                },
                true // start now
            );
        } catch (error) {
            console.log(error);
            response.status(500).json({code: 500, message: 'Etwas ist schief gelaufen.'});
            transaction.rollback();
            return;
        }

        response.status(200).json({code: 200, message: 'Reservierung erfolgreich.', reservationId: reservationId, expiry: expiration});
        return;
    }
}