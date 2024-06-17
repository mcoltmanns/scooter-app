import { Model, Transaction } from 'sequelize';
import { RESERVATION_LIFETIME, Reservation } from '../models/rental';
import database from '../database';
import { Scooter } from '../models/scooter';
import { Job, scheduleJob } from 'node-schedule';
import jobManager from './job-manager';

abstract class ReservationManager {
    /* check if a scooter is reserved */
    public static async getReservationFromScooter(scooterId: number, transaction?: Transaction): Promise<Model> {
      if (transaction) {
        return await Reservation.findOne({ where: { scooter_id: scooterId }, transaction: transaction });
      }
      return await Reservation.findOne({ where: { scooter_id: scooterId } });
    }

    /* check if a user has a reservation */
    public static async getReservationFromUser(userId: number, transaction?: Transaction): Promise<Model> {
      if (transaction) {
        return await Reservation.findOne({ where: {user_id: userId }, transaction: transaction });
      }
      return await Reservation.findOne({ where: {user_id: userId } });
    }

    // set a scooter as reserved for a user, if possible (scooter is free and user has no other reservations)
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    public static async startReservation(userId: number, scooterId: number, transaction?: Transaction): Promise<Model> {
        let reservation: Model;
        let expiration: Date;
        const transactionExtern: boolean = transaction !== undefined;

        if(!transactionExtern) transaction = await database.getSequelize().transaction();

        try {
            // can't reserve if the scooter isn't real
            const scooter = await Scooter.findByPk(scooterId, { transaction: transaction });
            if(!scooter) throw new Error('SCOOTER_DOES_NOT_EXIST');

            // can't reserve if scooter is reserved or rented
            if(scooter.getDataValue('active_rental_id') !== null || scooter.getDataValue('reservation_id') !== null || await this.getReservationFromScooter(scooterId) !== null) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // can't reserve if user already has reservation
            if(await this.getReservationFromUser(userId)) {
                throw new Error('USER_HAS_RESERVATION');
            }

            // all good?
            // create the new reservation
            expiration = new Date(Date.now() + RESERVATION_LIFETIME);
            reservation = await Reservation.create({ user_id: userId, scooter_id: scooterId, endsAt: expiration }, {transaction: transaction});
            // update scooters table
            scooter.setDataValue('reservation_id', reservation.dataValues.id);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
            // dispatch a job to delete the reservation when it expires
            this.scheduleReservationEnding(reservation);
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('RESERVATION_FAILED');
        }
        return reservation;
    }

    // end a reservation, freeing the scooter and user
    // if caller provides a transaction, use that and don't commit/rollback. otherwise, checkout and manage a new transaction
    public static async endReservation(reservation: Model, transaction?: Transaction, scooter?: Model): Promise<void> {
        const transactionExtern: boolean = transaction !== undefined;
        if(!transactionExtern) transaction = await database.getSequelize().transaction();
        try {
            /* Fetch the scooter if it wasn't provided */
            if (!scooter) {
              scooter = await Scooter.findByPk(reservation.getDataValue('scooter_id'), { transaction: transaction });
            }
            if(!scooter) throw new Error('SCOOTER_NOT_FOUND');

            // const scooter = await Scooter.findByPk(reservation.getDataValue('scooter_id'));
            await reservation.destroy({ transaction: transaction });
            scooter.setDataValue('reservation_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
            jobManager.removeJob(`reservation${reservation.getDataValue('id')}`); // remove yourself when done
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RESERVATION_FAILED');
        }
        return;
    }

    // job id will be 'reservation${reservation.id}'
    public static scheduleReservationEnding(reservation: Model): Job {
        const expiration: Date = reservation.getDataValue('endsAt');
        console.log(`scheduling reservation ending at ${expiration}`);
        const j = scheduleJob(`reservation${reservation.getDataValue('id')}`, expiration, async function(reservation: Model): Promise<void> {
            try {
                await this.endReservation(reservation);
                console.log('ended reservation');
            } catch (error) {
                console.error(`could not end reservation at scheduled time!\n${error}`);
            }
        }.bind(reservation)); // have to bind in in case of data change
        return j;
    }
}

export default ReservationManager;
