/**
 * rental management service
 * given a scooter, check if it's rented
 * given a user:
 * - initiate a rental with that user and the first availabe instance of the model queried (only if the user isn't already renting)
 * - end a rental
 */

import { Model } from 'sequelize';
import { Rental } from '../models/rental';

abstract class RentalManager {
    // get the rental associated with a scooter
    public static async getRentalsFromScooter(scooterId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { scooter_id: scooterId } });
    }

    // get all rentals associated with a user
    public static async getRentalsFromUser(userId: number): Promise<Model[]> {
        return await Rental.findAll({ where: { user_id: userId } });
    }
}

export default RentalManager;
