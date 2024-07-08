import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import uid from 'uid-safe';
import {expect, jest, describe, it, afterEach, beforeAll} from '@jest/globals';
import { UsersAuth, UsersData, UserPreferences, UsersSession, SESSION_LIFETIME } from '../../src/models/user';
import database from '../../src/database';
import { Mock, SpiedFunction } from 'jest-mock';
import { AuthController } from '../../src/controllers/auth';
import { Validator } from '../../src/middlewares/validation';
import { MockModel } from '../mocks/mock-model';
import { mockUserPreferencesData, mockUsersAuthData, mockUsersDatasData } from '../mocks/mock-data';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

/**
 * Testing the controller classes (src/controllers) is a good place to start, but not really that constructive.
 * Because of the way we structure our code, most of the heavy functionality happens in service classes (src/services).
 * However the auth controller makes sense to test, because its functionality is compact enough that it was never abstracted out.
 * Therefore we can run tests with supertest and simultaneously watch calls to the database.
 */

//--------------------------------STUBS/MOCKS----------------------------
// user we're going to try and add
const toAdd: {[key: string]: string }= { // weird typing because otherwise the linter has a fit when we try to index with strings
    name: 'John Doe',
    street: 'Main St',
    houseNumber: '1',
    zipCode: '12345',
    city: 'Washington',
    email: 'john@email.com',
    password: 'password'
};

// declare mock methods for rollback, commit, and sequelize.transaction()
let mockRollback: Mock;
let mockCommit: Mock;
let mockTransactionCall: Mock;
let mockTransactionInstance: { rollback: Mock, commit: Mock }; // declare mock transaction instance

// declare mock tables
let mockUsersAuth: MockModel;
let mockUsersData: MockModel;
let mockUsersPreferences: MockModel;
let mockUsersSession: MockModel;

// declare spy point for validator (used to check if validator runs or not)
let validator_runAllChecks: SpiedFunction;
let register: SpiedFunction<(request: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, response: Response<any, Record<string, any>>) => Promise<void>>;

const mockPwdHash = bcrypt.hashSync(toAdd.password, 10);

//------------------------TESTS--------------------------
describe('auth controller', () => {
    beforeAll(() => {
        // mock commit and rollbacks (do nothing because we're cut off from the database)
        mockRollback = jest.fn();
        mockCommit = jest.fn();
        // mock a transaction instance
        mockTransactionInstance = {
            rollback: mockRollback,
            commit: mockCommit
        };
        mockTransactionCall = (database.getSequelize() as any).transaction = jest.fn().mockReturnValue(mockTransactionInstance);

        validator_runAllChecks = jest.spyOn(Validator as any, 'runAllChecks'); // any is necessary here to spy on a private method
        register = jest.spyOn(AuthController.prototype, 'register'); // watch the registration method

        // initalize mock tables
        mockUsersAuth = new MockModel(UsersAuth, mockUsersAuthData);
        mockUsersData = new MockModel(UsersData, mockUsersDatasData);
        mockUsersPreferences = new MockModel(UserPreferences, mockUserPreferencesData);
        mockUsersSession = new MockModel(UsersSession, []);
    });

    afterEach(() => {
        jest.clearAllMocks(); // reset call/instance/contex/result info
    });

    it('should not allow access to restricted page without authorization', async () => {
        // try to access a restricted page
        await request(app)
            .post('/api/map')
            .expect(401); // should be unauthorized
    });

    // positive test case for registration
    it('should add new user and start new session upon registration', async () => {
        (bcrypt.hashSync as any) = jest.fn().mockReturnValue(mockPwdHash);
        const mockSessionId = uid.sync(24); // generate a mock session token to check against later
        (uid.sync as any) = jest.fn().mockReturnValue(mockSessionId);
        const then = Date.now();
        (Date.now as any) = jest.fn().mockReturnValue(then); // fix now to right now

        const response = await request(app)
            .post('/api/register') // ask to register
            .send(toAdd) // with the information defined above
            .expect(201); // should go well
        
        // check header
        const cookies = response.headers['set-cookie'];
        expect(cookies.length).toBe(1); // we should get exactly one cookie back
        expect(cookies[0]).toMatch(`sessionId=${mockSessionId}`); // and it should be named sessionId

        // check body
        expect(response.body.code).toBe(201); // should go well
        expect(response.body.message).toBe('Registrierung erfolgreich.'); // should say this

        // check calls
        expect(validator_runAllChecks).toBeCalledTimes(1); // the validator should run
        expect(mockRollback).toBeCalledTimes(0); // we should never rollback (there should be no silently-failing db writes)
        expect(mockCommit).toBeCalledTimes(1); // we should write exactly once
        expect(mockTransactionCall).toBeCalledTimes(1); // we should start exactly one transaction
        expect(mockUsersAuth.findOneMock).toBeCalledWith({ where: { email: toAdd.email } }); // we should have checked the database for the user we're adding
        // make sure everything happened under a transaction, and with the right parameters
        expect(mockUsersAuth.createMock).toBeCalledWith({ email: toAdd.email, password: mockPwdHash }, { transaction: mockTransactionInstance });
        expect(mockUsersData.createMock).toBeCalledWith({ name: toAdd.name, street: toAdd.street, houseNumber: toAdd.houseNumber, zipCode: Number(toAdd.zipCode), city: toAdd.city, usersAuthId: (mockUsersAuth.data.length - 1).toString()}, { transaction: mockTransactionInstance });
        expect(mockUsersPreferences.createMock).toBeCalledWith({ speed: 'km/h', distance: 'km', currency: '€', usersAuthId: (mockUsersAuth.data.length - 1).toString() }, { transaction: mockTransactionInstance });
        expect(mockUsersSession.createMock).toBeCalledWith({ id: mockSessionId, expires: new Date(then + SESSION_LIFETIME), usersAuthId: (mockUsersAuth.data.length - 1).toString() }, { transaction: mockTransactionInstance });
        // no need to check database state afterwards because we can assume that sequelize's methods are safe
    });

    // negative case: email already exists in database
    it('should require unique email for registration', async () => {
        const response = await request(app)
            .post('/api/register') // ask to register
            .send(toAdd) // with the user we already registered
            .expect(400); // should go bad

        expect(validator_runAllChecks).toBeCalledTimes(1); // validator should be called
        expect(mockUsersAuth.findOneMock).toBeCalledWith({ where: { email: toAdd.email } }); // should look for the email
        expect(register).toBeCalledTimes(0); // register method should never be called
        expect(response.status).toBe(400); // status should be bad
        expect(response.body).toStrictEqual({ // this is what we want the error message to look like
            code: 400,
            validationErrors: { email: 'E-Mail wird bereits verwendet.'}
        });
    });

    let mockSessionId: string;

    // positive login test case
    it('should start new session on login if no session existed', async () => {
        mockSessionId = uid.sync(24);
        (uid as any).sync = jest.fn().mockReturnValue(mockSessionId);
        const then = Date.now();
        (Date as any).now = jest.fn().mockReturnValue(then);

        // try to log in with the user we just added
        const response = await request(app)
            .post('/api/login')
            .send({ email: toAdd.email, password: toAdd.password })
            .expect(201);

        expect(response.status).toBe(201);
        expect(response.body).toStrictEqual({
            code: 201,
            message: 'Login erfolgreich.'
        });
        const cookies = response.headers['set-cookie'];
        expect(cookies.length).toBe(1); // we should get exactly one cookie back
        expect(cookies[0]).toMatch(`sessionId=${mockSessionId}`); // and it should be named sessionId

        // make sure a new session was created
        expect(mockUsersSession.createMock).toBeCalledWith({ expires: new Date(then + SESSION_LIFETIME), id: mockSessionId, usersAuthId: (mockUsersAuth.data.length - 1).toString()}, { transaction: mockTransactionInstance });
    });

    // positive logout test case
    it('should end session of user on logout', async () => {
        const response = await request(app)
            .delete('/api/logout')
            .set('Cookie', [`sessionId=${mockSessionId}`])
            .expect(200);

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            code: 200,
            message: 'Logout erfolgreich.'
        });

        // should clear the session cookie
        const cookies = response.headers['set-cookie'];
        expect(cookies.length).toBe(2); // should be 2 cookies - one for the old sessionId, one for the deleted
        expect(cookies[0]).toMatch(`sessionId=${mockSessionId};`); // old cookie should still match
        expect(cookies[1]).toMatch('sessionId=;'); // new cookie should be deleted

        // sucessful logout expects UsersSession.destroy to be called on the sessionId
        expect(mockUsersSession.destroyMock).toBeCalledWith({where: { id: mockSessionId }});
    });

    it('should not allow unknown users to login', async () => {
        const unknown = { email: 'person@mail.com', password: 'password' };
        const response = await request(app)
            .post('/api/login')
            .send(unknown)
            .expect(401);

        // we should fail on the email find
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
            code: 401, validationErrors: { email: 'E-Mail-Adresse nicht gefunden.' }
        });

        expect(mockUsersAuth.findOneMock).toBeCalledWith({ where: { email: unknown.email } }); // expect to have looked for the email that's trying to login
    });

    it('should not allow logins with wrong password', async () => {
        const passwordCheck = jest.spyOn(bcrypt, 'compareSync');
        const unknown = { email: toAdd.email, password: 'notPassword' };
        const response = await request(app)
            .post('/api/login')
            .send(unknown)
            .expect(401);

        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
            code: 401, validationErrors: { password: 'Falsches Passwort.' } // expect to have failed at password check
        });

        expect(mockUsersAuth.findOneMock).toBeCalledWith({ where: { email: unknown.email } }); // expect to have looked for the email that's trying to login
        expect(passwordCheck).toBeCalledWith(unknown.password, mockPwdHash); // expect to have compared the password on record with the password provided
    });
});
