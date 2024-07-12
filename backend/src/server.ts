import app from './app';
import Database from './database';

/**
 *  Zeige TypeScript Zeile in Fehlernachrichten
 */
import SourceMap from 'source-map-support';
import { UsersSession } from './models/user';
import { Op } from 'sequelize';
import { ActiveRental, Reservation } from './models/rental';
import ReservationManager from './services/reservation-manager';
import RentalManager from './services/rental-manager';
import { DYNAMIC_EXTENSION_INTERVAL_MS } from './static-data/global-variables';
import { errorMessages } from './static-data/error-messages';
SourceMap.install();

class Server {
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  async start(): Promise<void>{
    try {
      /* Connect to the database */
      await Database.connect();

      /* Purge all expired sessions */
      console.log('start: purging expired sessions...');
      const purgedSessions = await UsersSession.destroy({ where: { expires: { [Op.lt]: (new Date) } } });
      console.log(`start: purged ${purgedSessions} expired sessions.`);

      /* Purge all expired reservations */
      console.log('start: deleting and dereferencing expired reservations...');
      let reservations = await Reservation.findAll({ where: { endsAt: { [Op.lt]: (new Date) } } });
      for (const reservation of reservations) {
        try {
          await ReservationManager.endReservation(reservation);
        } catch (error) {
          console.error('start: Failed to delete reservation', reservation.dataValues.id + ':', error);
        }
      }
      console.log(`start: deleted and dereferenced ${reservations.length} expired reservations.\nscheduling deletion and dereferencing of remaining reservations...`);
      reservations = await Reservation.findAll({ where: { endsAt: { [Op.gte]: (new Date) } } });
      for (const reservation of reservations) {
        ReservationManager.scheduleReservationEnding(reservation);
      }
      console.log(`start: scheduled deletion for ${reservations.length} active reservations`);

      // Reschedule or end all active rentals
      const rentals = await ActiveRental.findAll();
      for(const rental of rentals) {
        if (new Date(rental.dataValues.nextActionTime) < (new Date)) {
          /* End the active rental if it is expired */
          console.log('start: End active rental', rental.dataValues.id, '(expired:', new Date(rental.dataValues.nextActionTime) + ')');
          const transaction = await Database.getSequelize().transaction();
          try {
            await RentalManager.endRental(rental.dataValues.id, transaction, rental);
            await transaction.commit();
          } catch (error) {
            console.error('start: Failed to end rental', rental.dataValues.id + ':', error);

            await transaction.rollback(); // Rollback the transaction in case of an error

            if (error.message === errorMessages.ERROR_ENDING_RENTAL) {
              try {
                rental.setDataValue('total_price', error.payload.targetAmountPaid); 
                rental.setDataValue('paymentOffset', error.payload.paymentOffset); 
                rental.setDataValue('renew', false);  // Set renew to false to prevent the rental from being extended or canceled by user again
                await rental.save(); // Save the updated rental in case the transaction was rolled back, no transaction is used here because the transaction was already rolled back
                const currentTime = new Date();
                RentalManager.scheduleRentalCheck(rental.getDataValue('id'), new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
              } catch (error) {
                /* Note: If the rental could not be saved after the payment activity, we have data inconsistency.
                 *       Normally would try to log this and inform the admin at this point, but for simplicity
                 *       (in the context of this project) we simply return an error message to the user and print
                 *       a statement to the console. */
                console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after possible payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
              }
            }

            if (error.message === errorMessages.SEVERE_ERROR_ENDING_RENTAL) {
              console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
            }

            if (error.message === errorMessages.ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED) {
              try {
                if (error.payload.chargedAmount) {
                  const currentPaymentOffset = parseFloat(parseFloat(rental.getDataValue('paymentOffset')).toFixed(2));
                  rental.setDataValue('paymentOffset', parseFloat((currentPaymentOffset + error.payload.chargedAmount).toFixed(2)));
                }
                rental.setDataValue('renew', false);  // Set renew to false to prevent the rental from being extended or canceled by user again
                await rental.save(); // Save the updated rental in case the transaction was rolled back, no transaction is used here because the transaction was already rolled back
                const currentTime = new Date();
                RentalManager.scheduleRentalCheck(rental.getDataValue('id'), new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
                console.log('start: Database transaction got rolled back. But could reflect already processed payment activity to the database. Try to end active rental', rental.getDataValue('id'), 'again later.');
              } catch (error) {
                /* Note: If the rental could not be saved after the payment activity, we have data inconsistency.
                 *       Normally would try to log this and inform the admin at this point, but for simplicity
                 *       (in the context of this project) we simply return an error message to the user and print
                 *       a statement to the console. */
                console.error('WARNING: Could not save the updated active rental ' + rental.getDataValue('id') + ' after payment activity. The rental is still active and may trigger payment activities again. Please check the database for inconsistencies.');
              }
            }
          }
          continue;
        }
        RentalManager.scheduleRentalCheck(rental.dataValues.id, new Date(rental.dataValues.nextActionTime));
      }

      /* Check for paymentOffset values that can be corrected */
      try {
        console.log('start: Correcting payment offsets...');
        await RentalManager.correctUnderpaidOffsetsOfAllUsers();
        console.log('start: Successfully corrected payment offsets.');
      } catch (error) {
        console.error('start: Failed to correct payment offsets:', error);
      }

      /* Start the server */
      app.listen(this.port, () => {
        console.log(
          'Server running at http://localhost:%d in %s mode',
          app.get('port'),
          app.get('env'),
        );
        console.log('Press CTRL-C to stop\n');
      });
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  }
}

const server = new Server(app.get('port'));
server.start();