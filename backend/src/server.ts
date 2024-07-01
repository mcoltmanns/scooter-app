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
        await ReservationManager.endReservation(reservation);
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
          await RentalManager.endRental(rental.dataValues.id);
          continue;
        }
        RentalManager.scheduleRentalCheck(rental.dataValues.id, new Date(rental.dataValues.nextActionTime));
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