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
      console.log('purging expired sessions...');
      const purgedSessions = await UsersSession.destroy({ where: { expires: { [Op.lt]: (new Date) } } });
      console.log(`purged ${purgedSessions} expired sessions.`);

      /* Purge all expired reservations */
      console.log('deleting and dereferencing expired reservations...');
      let reservations = await Reservation.findAll({ where: { endsAt: { [Op.lt]: (new Date) } } });
      for (const reservation of reservations) {
        try {
          await ReservationManager.endReservation(reservation);
        } catch (error) {
          console.error('Failed to delete reservation', reservation.dataValues.id + ':', error);
        }
      }
      console.log(`deleted and dereferenced ${reservations.length} expired reservations.\nscheduling deletion and dereferencing of remaining reservations...`);
      reservations = await Reservation.findAll({ where: { endsAt: { [Op.gte]: (new Date) } } });
      for (const reservation of reservations) {
        ReservationManager.scheduleReservationEnding(reservation);
      }
      console.log(`scheduled deletion for ${reservations.length} active reservations`);

      // Reschedule or end all active rentals
      const rentals = await ActiveRental.findAll();
      for(const rental of rentals) {
        if (new Date(rental.dataValues.nextActionTime) < (new Date)) {
          /* End the active rental if it is expired */
          console.log('End active rental', rental.dataValues.id, '(expired:', new Date(rental.dataValues.nextActionTime) + ')');
          try {
            await RentalManager.endRental(rental.dataValues.id);
          } catch (error) {
            console.error('start: Failed to end rental', rental.dataValues.id + ':', error);
            if (error.message === 'ERROR_ENDING_RENTAL_ACTIVE_RENTAL_IS_ENDED') {
              const currentTime = new Date();
              RentalManager.scheduleRentalCheck(error.payload.rentalId, new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS));  // Schedule a job to try ending the rental later
              console.log('start: Scheduled rental check for rental', error.payload.rentalId, 'at', new Date(currentTime.getTime() + DYNAMIC_EXTENSION_INTERVAL_MS), 'to try ending the rental again later.');
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