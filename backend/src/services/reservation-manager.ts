import { Model } from 'sequelize';
import { RESERVATION_LIFETIME, Reservation } from '../models/rental';
import RentalManager from './rental-manager';
import database from '../database';
import { Scooter } from '../models/scooter';
import { CronJob } from 'cron';

abstract class ReservationManager {
    /* check if a scooter is reserved */
    public static async getReservationFromScooter(scooterId: number): Promise<Model> {
        return await Reservation.findOne({ where: { scooter_id: scooterId } });
    }

    /* check if a user has a reservation */
    public static async getReservationFromUser(userId: number): Promise<Model> {
        return await Reservation.findOne({ where: {user_id: userId } });
    }

    // set a scooter as reserved for a user, if possible (scooter is free and user has no other reservations)
    public static async startReservation(userId: number, scooterId: number): Promise<Model> {
        let reservation: Model;
        let expiration: Date;

        // can't reserve if the scooter isn't real
        const scooter = await Scooter.findByPk(scooterId);
        if(!scooter) throw new Error('SCOOTER_DOES_NOT_EXIST');
        // can't reserve if scooter is reserved or rented
        console.log(await RentalManager.getRentalsFromScooter(scooterId));
        console.log(await this.getReservationFromScooter(scooterId));
        if((await RentalManager.getRentalsFromScooter(scooterId)).length !== 0 || await this.getReservationFromScooter(scooterId)) {
            console.log('reserved');
            throw new Error('SCOOTER_UNAVAILABLE');
        }
        // can't reserve if user already has reservation
        if(await this.getReservationFromUser(userId)) {
            console.log('user has reservation');
            throw new Error('USER_HAS_RESERVATION');
        }
        const transaction = await database.getSequelize().transaction();
        try {
            // all good?
            // create the new reservation
            expiration = new Date(Date.now() + RESERVATION_LIFETIME);
            reservation = await Reservation.create({ user_id: userId, scooter_id: scooterId, endsAt: expiration }, {transaction: transaction});
            // update scooters table
            scooter.setDataValue('reservation_id', reservation.dataValues.id);
            await scooter.save({transaction: transaction});
            await transaction.commit();
            // dispatch a job to delete the reservation when it expires
            new CronJob(
                expiration,
                async () => { // on tick
                    await this.endReservation(reservation);
                },
                () => {
                    console.log('deleted expired reservation'); // on complete
                },
                true // start now
            );
        } catch (error) {
            console.log(error);
            await transaction.rollback();
            throw new Error('RESERVATION_FAILED');
        }
        return reservation;
    }

    // end a reservation, freeing the scooter and user
    public static async endReservation(reservation: Model): Promise<void> {
        const transaction = await database.getSequelize().transaction();
        try {
            const scooter = await Scooter.findByPk(reservation.getDataValue('scooter_id'));
            await reservation.destroy({transaction: transaction});
            scooter.setDataValue('reservation_id', null);
            await scooter.save({transaction: transaction});
            await transaction.commit();
        } catch (error) {
            console.error(`could not end reservation!\n${error}`);
            await transaction.rollback();
        }
        return;
    }
}

export default ReservationManager;
