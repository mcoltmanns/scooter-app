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
                response.status(404).json({ code: 404, message: 'Keine Mietverträge gefunden.' });
                return;
            }

            response.status(200).json(rentals);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Mietverträge.' });
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
            const reservation = await ReservationManager.getReservationFromUser(userId);
            if(!reservation) {
                response.status(404).json('Keine Reservierung gefunden.');
                return;
            }
            response.status(200).json(reservation);
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json('Fehler beim Abrufen der Reservierung.');
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
                response.status(404).json('Keine Reservierung gefunden.');
                return;
            }
            await ReservationManager.endReservation(reservation);
            response.status(200).json(reservation);
            return;
        } catch (error) {
            console.error(error);
            response.status(500).json('Fehler beim Abrufen der Reservierung.');
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
            response.status(200).json(reservation);
            return;
        } catch (error) {
            if(error.message === 'SCOOTER_DOES_NOT_EXIST') {
                response.status(404).json('Angegebener Scooter existiert nicht');
                return;
            }
            if(error.message === 'SCOOTER_UNAVAILABLE'){
                response.status(401).json('Scooter ist derzeit nicht reservierbar.');
                return;
            }
            if(error.message === 'USER_HAS_RESERVATION') {
                response.status(401).json('User hat bereits eine Reservierung.');
                return;
            }
            if(error.message === 'RESERVATION_FAILED') {
                response.status(500).json('Reservierung konnte nicht angelegt werden.');
                return;
            }
            response.status(500).json(error.message);
            return;
        }
    }
}

export default new BookingsController();
