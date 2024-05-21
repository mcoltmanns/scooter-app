import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';

export class MapController {
    public async getAvailableScooters(request: Request, response: Response): Promise<void> {
        let scooters = [];
        try {
            scooters = (await Scooter.findAll({ where: { active_rental_id: null } })).map((scooterModel) => scooterModel.get());
        } catch (error) {
            console.log(error);
            response.status(500).json('Database error');
            return;
        }
        response.status(200).json(scooters);
        return;
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
}