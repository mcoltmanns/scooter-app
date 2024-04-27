import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import uid from 'uid-safe';
import Database from '../database';
import { UsersAuth, UsersData } from '../models/user';
import { SESSION_LIFETIME, UsersSession } from '../models/session';

export class AuthController {
  public async register(request: Request, response: Response): Promise<void> {
    /* Extract the received client data from the request body */
    const { name, street, houseNumber, zipCode, city, email, password } = request.body;

    /* Convert numbers from type string to type number */
    const houseNumberInt = Number(houseNumber);
    const zipCodeInt = Number(zipCode);

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
      createdUserAuth.setDataValue('usersSessionId', sessionId); // set the new user's session id
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
}
