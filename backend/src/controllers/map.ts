import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';

export class MapController {
    public async getAvailableScooters(request: Request, response: Response): Promise<void> {
        let scooters = [];
        try {
            scooters = (await Scooter.findAll({ where: { active_rental_id: null } })).map((scooterModel) => scooterModel.get());
        } catch (error) {
            console.log(error);
            response.status(500).json('Database error').send();
            return;
        }
        response.status(200).json(scooters);
        return;
    }
}