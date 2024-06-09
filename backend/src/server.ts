import app from './app';
import Database from './database';

/**
 *  Zeige TypeScript Zeile in Fehlernachrichten
 */
import SourceMap from 'source-map-support';
import { UsersSession } from './models/user';
import { Op } from 'sequelize';
import { Reservation } from './models/rental';
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
      const purgedSessions = await UsersSession.destroy({ where: { expires: { [Op.lt]: now } } }); // TODO: put this on a scheduler
      console.log(`purged ${purgedSessions} expired sessions.`);

      /* Purge all expired reservations */
      console.log('purging expired reservations...');
      const purgedReservations = await Reservation.destroy({ where: { endsAt: { [Op.lt]: now } } });
      console.log(`purged ${purgedReservations} expired reservations.`);

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