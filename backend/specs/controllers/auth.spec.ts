import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import uid from 'uid-safe';
import {expect, jest, test, describe, it, afterEach, beforeAll} from '@jest/globals';
import { UsersAuth, UsersData, UserPreferences, UsersSession, SESSION_LIFETIME } from '../../src/models/user';
import database from '../../src/database';
import { Mock, SpiedFunction } from 'jest-mock';
import { AuthController } from '../../src/controllers/auth';
import { Validator } from '../../src/middlewares/validation';
import { CreateOptions, FindOptions } from 'sequelize';
import { MockTable, dbEntryType } from '../mocks/mock-table';
import { mUsersAuths } from '../mocks/mock-table-types';

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

const toLogin: {[key: string]: string} = {
    email: 'jane@email.com',
    password: 'password'
};

const mockUsersAuthData: dbEntryType[] = [
    {
        id: '0',
        email: 'guy@email.com',
        password: 'HASHED1'
    },
    {
        id: '1',
        email: 'jane@email.com',
        password: 'HASHED2'
    }
];

const mockUsersSessionsData: dbEntryType[] = [];
const mockUsersDatasData: dbEntryType[] = [
    {
        id: '0',
        name: 'Guy',
        street: 'Street st.',
        houseNumber: '1b',
        zipCode: '12345',
        city: 'Chicago',
        usersAuthId: '0'
    },
    {
        id: '1',
        name: 'Jane',
        street: 'Avenue blvd.',
        houseNumber: '12a',
        zipCode: '54321',
        city: 'Baltimore',
        usersAuthId: '1'
    }
];
const mockUserPreferencesData: dbEntryType[] = [
    {
        id: '0',
        speed: 'km/h',
        distance: 'km',
        currency: '€'
    },
    {
        id: '1',
        speed: 'km/h',
        distance: 'km',
        currency: '€'
    }
];

// declare mock methods for rollback, commit, and sequelize.transaction()
let mockRollback: Mock;
let mockCommit: Mock;
let mockTransaction: Mock;
let mockTransactionInstance: { rollback: Mock, commit: Mock }; // declare mock transaction instance

// declare mock usersauth table
// look at those types go!
let mockUsersAuth: MockTable;
let usersAuthFindOne: Mock<(findOpts?: FindOptions<any> | undefined) => dbEntryType | null>;
let usersAuthFindAll: Mock<(findOpts?: FindOptions<any> | undefined) => dbEntryType[]>;
let usersAuthCreate: Mock<(data: unknown, createOpts?: CreateOptions<any> | undefined) => { getDataValue: (key: string) => string; }>;

// declare spy point for validator (used to check if validator runs or not)
let validator_runAllChecks: SpiedFunction;

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
        mockTransaction = (database.getSequelize() as any).transaction = jest.fn().mockReturnValue(mockTransactionInstance);

        validator_runAllChecks = jest.spyOn(Validator as any, 'runAllChecks'); // any is necessary here to spy on a private method

        // set up tracking for the users auth mock table
        mockUsersAuth = new MockTable(mockUsersAuthData);
        usersAuthFindOne = (UsersAuth as any).findOne = jest.fn((findOpts?: FindOptions) => {
            return mockUsersAuth.findOne(findOpts);
        });
        usersAuthFindAll = (UsersAuth as any).findAll = jest.fn((findOpts?: FindOptions) => {
            return mockUsersAuth.findAll(findOpts);
        });
        usersAuthCreate = (UsersAuth as any).create = jest.fn((data, createOpts?: CreateOptions) => {
            return mockUsersAuth.create(data as dbEntryType, createOpts);
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); // reset call/instance/contex/result info
    });

    // positive test case
    // this tests very closely what should happen when the input and database are correct
    it('should add new user and start new session upon registration', async () => {
        const mockHash = bcrypt.hashSync(toAdd.password, 10); // generate a mock hash to check against later
        (bcrypt.hashSync as any) = jest.fn().mockReturnValue(mockHash);
        const mockSessionId = uid.sync(24); // generate a mock session token to check against later
        (uid.sync as any) = jest.fn().mockReturnValue(mockSessionId);
        const then = Date.now();
        (Date.now as any) = jest.fn().mockReturnValue(then); // fix now to right now

        // do nothing for data, preference, and session db writes because we're cut off from the database
        // TODO: rewrite to use the mocks!
        const usersDataCreate = (UsersData as any).create = jest.fn();
        const userPreferencesCreate = (UserPreferences as any).create = jest.fn();
        const usersSessionCreate = (UsersSession as any).create = jest.fn();

        const response = await request(app)
            .post('/api/register') // ask to register
            .send(toAdd) // with the information defined above
            .expect(201); // should go well
        
        // check header
        const cookies = response.headers['set-cookie'];
        expect(cookies.length).toBe(1); // we should get exactly one cookie back
        expect(cookies[0]).toMatch(`sessionId=${mockSessionId}`); // and it should be named sessionId TODO: this regex probably needs to be stronger

        // check body
        expect(response.body.code).toBe(201); // should go well
        expect(response.body.message).toBe('Registrierung erfolgreich.'); // should say this

        // check calls
        expect(validator_runAllChecks).toBeCalledTimes(1); // the validator should run
        expect(mockRollback).toBeCalledTimes(0); // we should never rollback (there should be no silently-failing db writes)
        expect(mockCommit).toBeCalledTimes(1); // we should write exactly once
        expect(mockTransaction).toBeCalledTimes(1); // we should start exactly one transaction
        expect(usersAuthFindOne).toBeCalledWith({ where: { email: toAdd.email } }); // we should have checked the database for the user we're adding
        // TODO: instead of all this crud, just check mock db state against what you expect
        /*expect(usersAuthCreate).toBeCalledWith({ email: toAdd.email, password: mockHash }, { transaction: mockTransactionInstance }); // we should have created a usersAuth entry with the correct email and password hash and in a mockTransactionInstance
        expect(usersDataCreate).toBeCalledWith({ name: toAdd.name, street: toAdd.street, houseNumber: toAdd.houseNumber, zipCode: Number(toAdd.zipCode), city: toAdd.city, usersAuthId: 0 }, { transaction: mockTransactionInstance }); // we should have created a usersData entry with the correct data and in a mockTransactionInstance
        expect(userPreferencesCreate).toBeCalledWith({ speed: 'km/h', distance: 'km', currency: '€', usersAuthId: 0 }, { transaction: mockTransactionInstance }); // ditto for preferences
        expect(usersSessionCreate).toBeCalledWith({ id: mockSessionId, expires: new Date(then + SESSION_LIFETIME), usersAuthId: 0 }, { transaction: mockTransactionInstance }); // ditto for session*/

        // TODO: really we also need something like 'and nothing else passes the test'. can we do that?
    });

    // negative case: email already exists in database
    it('should require unique email for registration', async () => {
        const usersAuthFindOne = (UsersAuth as any).findOne = jest.fn().mockReturnValue(true); // mock email found (we're assuming the validator found someone with a matching email)

        const register = jest.spyOn(AuthController.prototype, 'register'); // watch the registration method
        
        const response = await request(app)
            .post('/api/register') // ask to register
            .send(toAdd) // with the information defined above
            .expect(400); // should go bad

        expect(validator_runAllChecks).toBeCalledTimes(1); // validator should be called
        expect(usersAuthFindOne).toBeCalledWith({ where: { email: toAdd.email } }); // should look for the email
        expect(register).toBeCalledTimes(0); // register method should never be called
        expect(response.status).toBe(400); // status should be bad
        expect(response.body).toStrictEqual({ // this is what we want the error message to look like
            code: 400,
            validationErrors: { email: 'E-Mail wird bereits verwendet.'}
        });
    });

    // positive login test case
    it('should start new session on login if no session existed', () => {
        // mock database containing users auth info
        const usersAuthFindOne = (UsersAuth as any).findOne = jest.fn((findOptions?: FindOptions) => {
            //if(!findOptions) return mockUsersAuth[0]; // no find options? return first auth we see
        });
        /*.mockReturnValue({
            getDataValue: (key: string) => {
                return mockUsersAuth[key];
            }
        });*/

        const usersSessionFindOne = (UsersSession as any).findOne = jest.fn().mockReturnValue(null); // mock no session

        const usersSessionCreate = (UsersSession as any).create = jest.fn().mockReturnValue({
            getDataValue: (key: string) => {
                
            }
        });
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
