import { Request, Response } from 'express';
import { Sequelize } from 'sequelize';
import * as defaults from 'src/models/sequelize/user';

const sequelize = new Sequelize('postgres://admin:spro-g6-db@localhost:5432/postgres'); // connect to the database

const usersTable = sequelize.define('Users', userAttribs);

export class DatabaseController {
    public status(req: Request, resp: Response): void {
        // TODO make sure the database is running!
        sequelize.authenticate()
            .then(() => {
                resp.status(200);
                resp.json('database OK');
            })
            .catch(err => { // databse is unavailable for whatever reason
                resp.status(503);
                resp.json({ databseError: err });
            });
    }
}