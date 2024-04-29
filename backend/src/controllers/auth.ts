import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import uid from 'uid-safe';
import Database from '../database';
import { UsersAuth, UsersData } from '../models/user';
import { SESSION_LIFETIME, UsersSession } from '../models/session';
import SessionManager from '../session-manager';

/**
 * All authorization functions should go here - anything login or registration related
 */
export class AuthController {
  public async register(request: Request, response: Response): Promise<void> {
    /* Extract the received client data from the request body */
    const { name, street, houseNumber, zipCode, city, email, password } = request.body;

    /* Convert numbers from type string to type number */
    const houseNumberInt = Number(houseNumber);
    const zipCodeInt = Number(zipCode);

    //TODO: should probably check request contents (return error 400 if bad)

    /* Hash the provided password */
    //TODO: this is dangerous! passwords should not arrive in plaintext
    let passwordHash;
    try {
      passwordHash = bcrypt.hashSync(password, 10); // Hash password
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Something went wrong' }); // 500: Internal Server Error
      return;
    }

    /* Start a transaction to solve multiple db queries at once and protect against the problem of partial success */
    const transaction = await Database.getSequelize().transaction();

    let createdUserAuth;
    try {
      /* Create a new user auth object */
      const newUserAuth = {
        email,
        password: passwordHash
      };

      /* Save the new user auth object in the database */ 
      createdUserAuth = await UsersAuth.create(newUserAuth, { transaction });

      /*  Create a new user data object */
      const newUserData = {
        name,
        street,
        houseNumber: houseNumberInt,
        zipCode: zipCodeInt,
        city,
        usersAuthId: createdUserAuth.getDataValue('id')
      };

      /* Save the new user data object in the database */ 
      await UsersData.create(newUserData, { transaction });

      // create a new session for this new user
      const sessionId = uid.sync(24);
      const expiry = new Date(Date.now() + SESSION_LIFETIME);
      const sessionData = {
        id: sessionId,
        expires: expiry,
        usersAuthId: createdUserAuth.getDataValue('id'),
      };
      // save the new session
      await UsersSession.create(sessionData, { transaction });
      /*
       * Cookie Optionen:
       * Für Cookies die nicht per JavaScript abgefragt werden können: "httpOnly: true"
       * Für Cookies die nur über HTTPS gesendet werden dürfen: "secure: true"
       * Für Basisschutz vor CSRF: "sameSite: 'lax'" oder "sameSite: 'strict'" (Bei lax sind gewisse Anfragen von anderen Webseiten noch erlaubt z.B. GET)
       * Für ein Ablaufzeitpunkt des Cookies (z.B. in einer Stunde): "maxAge: 60 * 60 * 1000" oder "expires: new Date(Date.now() + 60 * 60 * 1000)"
       */
      response.cookie('sessionId', sessionId, { httpOnly: true, expires: expiry });

      /* Commit the transaction */
      await transaction.commit();
    } catch (error) {
      await transaction.rollback(); // Rollback the transaction in case of an error
      response.status(500).json({ code: 500, message: 'Something went wrong.', body: `${error}` }); // 500: Internal Server Error
      return;
    }

    /* Send a success message */
    response.status(201).json({ code: 201, message: 'Registration successful.' });
    return;
  }

  public async login(request: Request, response: Response): Promise<void> {
    const { email, passwordHash } = request.body; // get relevant info from the request
    if(!email || !passwordHash) { // email or password is missing!
      response.status(400).json('Malformed login request');
      return;
    }
    console.log(`Trying to login as ${email}, ${passwordHash}`);
    // find a user with the given email
    const user = await UsersAuth.findOne({ where: { email: email } }); // find the user with this email
    if(user) { // user exists
      const userId = user.getDataValue('id');
      // check the password hash
      if(user.getDataValue('password') === passwordHash) {
        // user has provided correct password
        console.log('Password ok');
        let session = await SessionManager.hasValidSession(userId); // see if the user has a valid session
        if(session !== null) { // if they do, log them in to that one
          console.log('found an active session');
          response.cookie('sessionId', session.getDataValue('id'), { httpOnly: true, expires: session.getDataValue('expires') });
        }
        else { // if they don't, generate a new session and log them in
          console.log('no session found. making one');
          const transaction = await Database.getSequelize().transaction(); // start a new transaction
          session = await SessionManager.createSession(user.getDataValue('id'), transaction); // create a new session
          try {
            /* Commit the transaction */
            await transaction.commit();
            response.cookie('sessionId', session.getDataValue('id'), { httpOnly: true, expires: session.getDataValue('expires') }); // set the cookie
          } catch (error) {
            await transaction.rollback(); // Rollback the transaction in case of an error
            response.status(500).json({ code: 500, message: 'Something went wrong.', body: `${error}` }); // 500: Internal Server Error
            return;
          }
        }
        response.status(200).json('Login successful');
        return;
      }
      else {
        response.status(403).json('Incorrect password');
      }
    }
    else {
      response.status(401).json(`Could not find a user with email ${email}. Please create an account.`);
    }
    return;
  }
}
