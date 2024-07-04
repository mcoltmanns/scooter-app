import { Model, Transaction } from 'sequelize';
import { Reservation } from '../models/rental';
import database from '../database';
import { Scooter } from '../models/scooter';
import { Job, scheduleJob } from 'node-schedule';
import jobManager from './job-manager';
import { Product } from '../models/product';
import { RESERVATION_LIFETIME_MS } from '../static-data/global-variables';

abstract class ReservationManager {
    /* check if a scooter is reserved */
    public static async getReservationFromScooter(scooterId: number, transaction?: Transaction): Promise<Model> {
      if (transaction) {
        return await Reservation.findOne({ where: { scooter_id: scooterId }, transaction: transaction });
      }
      return await Reservation.findOne({ where: { scooter_id: scooterId } });
    }

    /* check if a user has a reservation */
    public static async getReservationFromUser(userId: number, transaction?: Transaction, withProduct = false): Promise<Model> {
      if (withProduct) {
        const reservation = await Reservation.findOne({
          where: { user_id: userId },
          transaction: transaction || undefined,
          include: [{
            model: Scooter,
            as: 'scooter',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['name', 'image'], // Select only the neccessary fields from the Product table
            }],
          }],
        });

        if (!reservation) {
          return null;
        }

        /* If the scooter is not set, the reservation only exists in the reservations table but not in the scooters table.
           This means we have inconsistent data. We therefore destroy the reservation and return null. */
        if (!reservation.get('scooter')) {
          await this.endReservation(reservation, transaction ? transaction : undefined);
          return null;
        }
    
        /* Post-process the result to rename the attributes and remove the scooter object */
        const { scooter, ...otherFields } = reservation.get({ plain: true });
        const { product } = scooter;
        return { ...otherFields, scooterName: product.name, scooterImage: product.image };
      }
      
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
            if(scooter.getDataValue('active_rental_id') !== null || scooter.getDataValue('reservation_id') !== null || await ReservationManager.getReservationFromScooter(scooterId) !== null) {
                throw new Error('SCOOTER_UNAVAILABLE');
            }

            // can't reserve if user already has reservation
            if(await ReservationManager.getReservationFromUser(userId)) {
                throw new Error('USER_HAS_RESERVATION');
            }

            // all good?
            // create the new reservation
            expiration = new Date(Date.now() + RESERVATION_LIFETIME_MS);
            reservation = await Reservation.create({ user_id: userId, scooter_id: scooterId, endsAt: expiration }, {transaction: transaction});
            // update scooters table
            scooter.setDataValue('reservation_id', reservation.dataValues.id);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
            // dispatch a job to delete the reservation when it expires
            ReservationManager.scheduleReservationEnding(reservation);
        } catch (error) {
            console.log(error);
            if(!transactionExtern) await transaction.rollback();
            throw new Error(error.message);
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

            /* Check if the reservation still exists in the database. If we don't do this, we might
               end up deleting a reservation from scooters table that has changed in the meantime. */
            const existingReservation = await Reservation.findByPk(reservation.getDataValue('id'), { transaction: transaction });
            if (!existingReservation) {
              throw new Error('RESERVATION_DOES_NOT_EXIST_ANYMORE');
            }

            await reservation.destroy({ transaction: transaction });
            scooter.setDataValue('reservation_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
            jobManager.removeJob(`reservation${reservation.getDataValue('id')}`); // remove yourself when done
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error(error.message);
        }
        return;
    }

    // job id will be 'reservation${reservation.id}'
    public static scheduleReservationEnding(reservation: Model): Job {
        const expiration: Date = reservation.getDataValue('endsAt');

        /* If the expiration is not in the future, don't schedule a Job */
        const now = new Date();
        if (expiration <= now) {
            return;
        }

        console.log(`scheduling reservation ending at ${expiration}`);
        const j = scheduleJob(`reservation${reservation.getDataValue('id')}`, expiration, (async (): Promise<void> => {
            try {
                await ReservationManager.endReservation(reservation);
                console.log('ended reservation');
            } catch (error) {
                console.error(`could not end reservation at scheduled time!\n${error}`);
            }
        }));
        return j;
    }
}

export default ReservationManager;
