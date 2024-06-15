import app from './app';
import Database from './database';

/**
 *  Zeige TypeScript Zeile in Fehlernachrichten
 */
import SourceMap from 'source-map-support';
import { UsersSession } from './models/user';
import { Op } from 'sequelize';
import { Rental, Reservation } from './models/rental';
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

      const now = new Date;

      /* Purge all expired sessions */
      console.log('purging expired sessions...');
      const purgedSessions = await UsersSession.destroy({ where: { expires: { [Op.lt]: now } } });
      console.log(`purged ${purgedSessions} expired sessions.`);

      // FIXME: these are really hacky! What really needs to be done is define database relationships in such a way that these null setting operations are done automatically
      /* Purge all expired reservations */
      console.log('purging expired reservations...');
      const purgedReservations = await Reservation.findAll({ where: { endsAt: { [Op.lt]: now } } });
      for (const reservation of purgedReservations) {
        await ReservationManager.endReservation(reservation);
      }
      console.log(`purged ${purgedReservations.length} expired reservations.`);

      /* Purge all expired rentals */
      console.log('purging expired rentals...');
      const purgedRentals = await Rental.findAll({ where: { endedAt: { [Op.lt]: now } } });
      for (const rental of purgedRentals) {
        await RentalManager.endRental(rental);
      }
      console.log(`purged ${purgedRentals.length} expired rentals`);

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