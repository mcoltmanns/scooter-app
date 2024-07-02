import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import {expect, jest, test, describe, it, afterAll, beforeEach} from '@jest/globals';
import { DataTypes, Sequelize } from 'sequelize';
import { UsersAuth, UsersData, UserPreferences, UsersSession } from '../../src/models/user';
import database from '../../src/database';

/**
 * Testing the controller classes (src/controllers) is a good place to start, but not really that constructive.
 * Because of the way we structure our code, most of the heavy functionality happens in service classes (src/services).
 * However the auth controller makes sense to test, because its functionality is compact enough that it was never abstracted out.
 * Therefore we can run tests with supertest and simultaneously watch calls to the database.
 */

const dPassword = 'password';
const dPwdHash = bcrypt.hashSync(dPassword, 10);
const dUsersAuth = { id: 0, email: 'dummy@email.com', password: dPwdHash };
const dUsersData = { id: 0, name: 'Dummy', street: 'Street', houseNumber: '1', zipCode: '12345', city: 'Town' };

describe('auth controller', () => {
    beforeEach(() => {
        jest.fn(database.getSequelize().transaction);
        jest.fn(UsersAuth.create);
        jest.fn(UsersData.create);
        jest.fn(UserPreferences.create);
        jest.fn(UsersSession.create);
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it('should add new user and start new login session upon registration', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'John Doe',
                street: 'Main St',
                houseNumber: '1',
                zipCode: '12345',
                city: 'Washington',
                email: 'john@doe.com',
                password: 'password'
            });
            //.expect(201);
        
        const cookies = response.headers['set-cookie'];
        console.log(response.headers);
        //expect(response.body.code).toBe(201);
        //expect(response.body.message).toBe('Registrierung erfolgreich.');
    });

    it('should require unique email for registration', () => {

    });

    it('should start new session on login', () => {

    });

    it('should not allow unknown users to login', () => {

    });

    it('should not allow logins with wrong password', () => {

    });

    it('should log users with active sessions out', () => {

    });

    it('should not permit accessing or changing user data without an active session', () => {

    });
});
