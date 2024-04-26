import app from './app';
import Database from './database';

/**
 *  Zeige TypeScript Zeile in Fehlernachrichten
 */
import SourceMap from 'source-map-support';
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