import { Request, Response } from 'express';

export class MapController {
    public getDummyScooterInfo(request: Request, response: Response): void {
        response.status(200).json({ id: 1, product_id: 'Nimbus 2000', battery: 22.974573, coordinates_lat: 47.665066, coordinates_lng: 9.177526 }).send();
        return;
    }
}