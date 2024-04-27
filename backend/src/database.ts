import { Sequelize } from 'sequelize';

class Database {
  public sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize('postgres://admin:spro-g6-db@localhost:5432/swp');
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('Connection to the database has been established successfully.');

      /* Create the tables if they do not exist (should be removed in production) */
      await this.sequelize.sync();
      console.log('Database and tables created.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1); // Exit the process with a 'failure' code
    }
  }
}

export default new Database();