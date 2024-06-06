import { Request, Response } from 'express';
import { Rental } from '../models/rental';

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
}