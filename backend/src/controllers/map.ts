import { Request, Response } from 'express';
import { Scooter } from '../models/scooter';

export class MapController {
    public async getAvailableScooters(request: Request, response: Response): Promise<void> {
        let scooters = [];
        try {
            scooters = (await Scooter.findAll()).map((scooterModel) => scooterModel.get());
            console.log(scooters);
        } catch (error) {
            console.log(error);
        }
        response.status(200).json(scooters).send();
        return;
    }
}