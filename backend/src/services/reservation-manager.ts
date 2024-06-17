import { Model, Transaction } from 'sequelize';
import { RESERVATION_LIFETIME, Reservation } from '../models/rental';
import database from '../database';
import { Scooter } from '../models/scooter';
import { CronJob } from 'cron';
import { Product } from '../models/product';

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

            await reservation.destroy({ transaction: transaction });
            scooter.setDataValue('reservation_id', null);
            await scooter.save({transaction: transaction});
            if(!transactionExtern) await transaction.commit();
        } catch (error) {
            if(!transactionExtern) await transaction.rollback();
            throw new Error('END_RESERVATION_FAILED');
        }
        return;
    }

    public static scheduleReservationEnding(reservation: Model): void {
        const expiration: Date = reservation.getDataValue('endsAt');
        console.log(`scheduling reservation ending at ${expiration}`);
        new CronJob(
            expiration,
            async () => {
                try {
                    await this.endReservation(reservation);
                    console.log('ended reservation');
                } catch (error) {
                    console.error(`could not end reservation at scheduled time!\n${error}`);
                }
            },
            null,
            true // start now
        );
    }
}

export default ReservationManager;
