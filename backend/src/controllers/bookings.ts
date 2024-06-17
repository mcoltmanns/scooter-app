import { Request, Response } from 'express';
import ReservationManager from '../services/reservation-manager';
import RentalManager from '../services/rental-manager';

// manages information about rentals and reservations
export class BookingsController {
    /* Method that returns all entries from the Rentals table for a specific User_Id */
    public async getUserRentals(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        try {
            const rentals = await RentalManager.getRentalsFromUser(userId);

            if (rentals.length === 0) {
                response.status(404).json({ code: 404, message: 'Keine Buchungen gefunden.' });
                return;
            }

            response.status(200).json({ code: 200, rentals: rentals });
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Buchungen.' });
        }
    }

    // get the reservation for a user, if it exists
    public async getUserReservation(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }

        try {
            /* Get the reservation for the user including name and image from the product table */
            const reservation = await ReservationManager.getReservationFromUser(userId, null, true);
            if(!reservation) {
              response.status(200).json({ code: 200, message: 'Keine Reservierung gefunden.' });
              return;
            }

            response.status(200).json({ code: 200, reservation: reservation });
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Reservierung.' });
        }
    }

    // end the reservation for a user, if it exists
    public async endUserReservation(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }
        try {
            const reservation = await ReservationManager.getReservationFromUser(userId);
            if(!reservation) {
                response.status(404).json({ code: 404, message: 'Keine Reservierung gefunden.' });
                return;
            }
            await ReservationManager.endReservation(reservation);

            response.status(200).json({ code: 200, message: 'Reservierung erfolgreich beendet.' });
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Aufheben der Reservierung.' });
        }
    }

    // reserve a scooter for a given user
    public async reserveScooter(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cookie
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }
        const scooterId = request.body.scooterId;
        try {
            const reservation = await ReservationManager.startReservation(userId, scooterId);
            
            response.status(200).json({ code: 200, reservation: reservation });
            return;
        } catch (error) {
            if(error.message === 'SCOOTER_DOES_NOT_EXIST') {
                response.status(404).json({ code: 404, message: 'Angegebener Scooter existiert nicht.' });
                return;
            }
            if(error.message === 'SCOOTER_UNAVAILABLE'){
                response.status(401).json({ code: 401, message: 'Scooter ist nicht mehr verfügbar.', scooterAvailable: false });
                return;
            }
            if(error.message === 'USER_HAS_RESERVATION') {
                response.status(401).json({ code: 401, message: 'Es kann nur ein Scooter gleichzeitig reserviert werden.' });
                return;
            }
            if(error.message === 'RESERVATION_FAILED') {
                response.status(500).json({ code: 500, message: 'Reservierung konnte nicht angelegt werden.' });
                return;
            }
            response.status(500).json({ code: 500, message: 'Fehler beim Reservieren. Bitte versuche es später noch einmal.' });
            return;
        }
    }
}

export default new BookingsController();
