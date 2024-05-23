import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';
import { Product } from '../models/product';
import { Rental } from '../models/rental';

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

    /* method that books a scooter */
    public async bookScooter(request: Request, response: Response): Promise<void> {
        const { scooterId, userId } = request.body;

        try {
            const scooter = await Scooter.findByPk(scooterId);
            if (!scooter) {
                response.status(404).json({ message: 'Roller nicht gefunden' });
                return;
            }

            if (scooter.get('active_rental_id') !== null) {
                response.status(400).json({ message: 'Roller ist bereits gebucht' });
                return;
            }

            const rental = await Rental.create({
                //id: 1,
                endedAt: new Date(),
                user_id: userId,
                scooter_id: scooterId,
            });            

            scooter.set('active_rental_id', rental.get('id'));
            await scooter.save();

            response.status(200).json({ message: 'Roller erfolgreich gebucht', rental });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: 'Fehler bei der Buchung des Rollers' });
        }
    }
}