import { Request, Response } from 'express';
import { Rental } from '../models/rental';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Op } from 'sequelize';

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

    /* Method taht return for all bookings the product + the scooterId from the scooter table */
    public async getRentalProducts(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId; // get userID from session cooki

        try {
            // Get all rental contracts of the user
            const rentals = await Rental.findAll({ where: { user_id: userId } });

            // / Extract the scooter IDs from the rental agreements
            const scooterIds = rentals.map(rental => rental.get('scooter_id'));

            
            // Search for the names of the scooters using their IDs in the scooter table
            const scooters = await Scooter.findAll({ 
                where: { id: { [Op.in]: scooterIds } },
                include: [{ model: Product }] // Include to retrieve the associated products
            });
            
            // Extract the names of the scooters found
            const scooterNames = scooters.map(scooter => scooter.get('product_id'));
            const products = await Product.findAll({ 
                where: { name: { [Op.in]: scooterNames } } 
            });

            const productsWithScooterId = products.map(product => {
                const scooterId = scooters.find(scooter => scooter.get('product_id') === product.get('name'))?.get('id');
                return { ...product.toJSON(), scooterId };
            });

            response.status(200).json(productsWithScooterId);
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen der Produkte.' });
        }
    }
}