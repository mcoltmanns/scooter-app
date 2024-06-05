import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Rental } from '../models/rental';
import Database from '../database';

export class MapController {
    public async getAvailableScooters(request: Request, response: Response): Promise<void> {
        let scooters = [];
        try {
            scooters = (await Scooter.findAll({ where: { active_rental_id: null } })).map((scooterModel) => scooterModel.get());
        } catch (error) {
            console.log(error);
            response.status(500).json('Datenbank Fehler');
            return;
        }
        response.status(200).json(scooters);
        return;
    }

    /* Method to get scooter information by scooter ID */
    public async getScooterById(request: Request, response: Response): Promise<void> {
        const { scooterId } = request.params;

        try {
            const scooter = await Scooter.findByPk(scooterId); // find the scooter with the matching ID

            if (!scooter) {
                response.status(404).json({ code: 404, message: 'Scooter nicht gefunden.' });
                return;
            }

            response.status(200).json(scooter); // return the scooter information
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen des Scooters.' });
        }
    }

    /* method that gets all product information from the database */
    public async getAllProducts(request: Request, response: Response): Promise<void> {
        try {
            const products = await Product.findAll();
            response.status(200).json(products);
        } catch (error) {
            console.error(error);
            response.status(500).send('Fehler in der Produkt Tabelle');
        }
    }

    /* Method to get product information for a specific scooter ID */
    public async getProductByScooterId(request: Request, response: Response): Promise<void> {
        const { scooterId } = request.params;

        try {
            // Find the scooter with the corresponding ID
            const scooter = await Scooter.findOne({ where: { id: scooterId } });

            if (!scooter) {
                response.status(404).json({ code: 404, message: 'Scooter nicht gefunden.' });
                return;
            }

            // Find the product based on the product_id of the scooter
            const product = await Product.findOne({ where: { name: scooter.get('product_id') } });

            if (!product) {
                response.status(404).json({ code: 404, message: 'Produkt nicht gefunden.' });
                return;
            }

            response.status(200).json(product); // Return of the product for the specific scooter
        } catch (error) {
            console.error(error);
            response.status(500).json({ code: 500, message: 'Fehler beim Abrufen des Produkts.' });
        }
    }


    /* method that books a scooter */
    public async bookScooter(request: Request, response: Response): Promise<void> {
        const userId = response.locals.userId;
        if (!userId) {
            response.status(401).json({ code: 401, message: 'Kein Benutzer angegeben.' });
            return;
        }
        const { scooterId } = request.body; //DER REQUEST BODY MUSS SPÄTER NOCH ALS PARAMETER END_DATE NEHMEN

        /* Start a transaction to solve multiple db queries at once and protect against the problem of partial success */
        const transaction = await Database.getSequelize().transaction();

        try {
            const scooter = await Scooter.findByPk(scooterId);
            if (!scooter) {
                response.status(404).json({ code: 404, message: 'Roller nicht gefunden.' });
                return;
            }

            if (scooter.get('active_rental_id') !== null) {
                response.status(400).json({code: 400, message: 'Roller ist bereits gebucht.' });
                return;
            }

            const hours = 3; // DUMMY VAR FOR HOW LONG RENTED
            const endDate = new Date(Date.now() + hours * 60 * 60 * 1000); // Adding the specified number of hours in milliseconds

            const newRental = {
                endedAt: endDate,
                user_id: userId,
                scooter_id: scooterId,
            };

            const rental = await Rental.create(newRental, { transaction });
            
            //throw new Error('test');

            scooter.set('active_rental_id', rental.get('id'));
            await scooter.save({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback(); // Rollback the transaction in case of an error
            console.error(error);
            return;
        }

        response.status(200).json({ code: 200, message: 'Roller erfolgreich gebucht'});
        return;
    }
}