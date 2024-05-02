import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import uid from 'uid-safe';
import Database from '../database';
import { UsersAuth, UsersData } from '../models/user';
import { SESSION_LIFETIME, UsersSession } from '../models/user';
import SessionManager from '../services/session-manager';

/**
 * All authorization functions should go here - anything login or registration related
 */
export class AuthController {
    public async authorize(request: Request, response: Response, next: NextFunction): Promise<void> {
    /* Check if the client has sent a session cookie */
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(401).json({ code: 401, validationErrors: { sessionId: 'No session, please log in' } }); // 401: Unauthorized
      return;
    };

    /* Check if the session exists */
    const session = await UsersSession.findOne({ where: { id: sessionId } });
    if (!session) {
      response.status(401).json({ code: 401, validationErrors: { sessionId: 'Session does not exist, please log in' } }); // 401: Unauthorized
      return;
    }

    /* Check if the session has expired */
    if(await SessionManager.sessionExpired(session)) {
      response.status(401).json({ code: 401, validationErrors: { sessionId: 'Session expired, please log in' } }); // 401: Unauthorized
      return;
    }

    /* Extend the expiration date of the current session.
     * NOTE: Automatically extending the session duration is a common practice to keep the user logged in,
     * but is a security-related measure. Implementing this in production requires careful consideration and testing.
     */
    const newExpiry = new Date(Date.now() + SESSION_LIFETIME);
    session.setDataValue('expires', newExpiry);
    
    /* Save the changes to the database */
    try {
      await session.save();
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Something went wrong' }); // 500: Internal Server Error
      return;
    }

    /* Update the session cookie */
    response.cookie('sessionId', sessionId, { httpOnly: true, expires: newExpiry });
    
    /* Save the session in the response locals */
    response.locals.sessionId = session.getDataValue('id');
    response.locals.userId = session.getDataValue('usersAuthId');

    return next();
  }


  public async register(request: Request, response: Response): Promise<void> {
    /* Extract the received client data from the request body */
    const { name, street, houseNumber, zipCode, city, email, password } = request.body;

    /* Convert numbers from type string to type number */
    const houseNumberInt = Number(houseNumber);
    const zipCodeInt = Number(zipCode);

    /* Hash the provided password */
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
      response.status(500).json({ code: 500, message: 'Something went wrong', body: `${error}` }); // 500: Internal Server Error
      return;
    }

    /* Send a success message */
    response.status(201).json({ code: 201, message: 'Registration successful' });
    return;
  }

  public async login(request: Request, response: Response): Promise<void> {
    /* Extract the received client data from the request body */
    const { email, password } = request.body;

    /* Search for the user in the database */
    const user = await UsersAuth.findOne({ where: { email: email } });
    if (!user) {
      response.status(401).json({ code: 401, validationErrors: { email: 'Email address was not found' } }); // 401: Unauthorized
      return;
    }

    /* Check if the provided password matches the hashed password in the database */
    if (!bcrypt.compareSync(password, user.getDataValue('password'))) {
      response.status(401).json({ code: 401, validationErrors: { password: 'Wrong password' } }); // 401: Unauthorized
      return;
    }

    /* Check if the user already has an active session */
    const activeSession = await SessionManager.isValidSession(request.cookies.sessionId, user.getDataValue('id'));
    if (activeSession) {
      response.status(200).json({ code: 200, message: 'Already logged in' });
      return;
    }

    // TODO: Check if the user has an active session even if the session cookie is not set if we want stick to one session per user

    /* Create a new session for the user */
    const newSession = await SessionManager.createSession(user.getDataValue('id'));
    
    /* Set the session cookie and send a success message */
    response.cookie('sessionId', newSession.getDataValue('id'), { httpOnly: true, expires: newSession.getDataValue('expires') }).status(201).json({ code: 201, message: 'Login successful' });
    return;

    // if(!email || !passwordHash) { // email or password is missing!
    //   response.status(400).json('Malformed login request');
    //   return;
    // }
    // console.log(`Trying to login as ${email}, ${passwordHash}`);
    // // find a user with the given email
    // const user = await UsersAuth.findOne({ where: { email: email } }); // find the user with this email
    // if(!user) { // user exists?
    //   response.status(401).json(`Could not find a user with email ${email}. Please create an account.`);
    //   return;
    // }
    // if(user.getDataValue('password') !== passwordHash) { // password ok?
    //   response.status(403).json('Incorrect password');
    //   return;
    // }
    // const userId = user.getDataValue('id');
    // let session = await(SessionManager.isValidSession(userId)); // see if user has a session
    // if(session !== null) { // if they do, log them in to that one
    //   console.log('found an active session');
    //   response.cookie('sessionId', session.getDataValue('id'), { httpOnly: true, expires: session.getDataValue('expires') }).status(200).json('Login successful.');
    //   return;
    // }
    // else { // if they don't, generate a new session and log them in
    //   console.log('no session found. making one');
    //   const transaction = await Database.getSequelize().transaction(); // start a new transaction
    //   session = await SessionManager.createSession(user.getDataValue('id'), transaction); // create a new session
    //   try {
    //     /* Commit the transaction */
    //     await transaction.commit();
    //     response.cookie('sessionId', session.getDataValue('id'), { httpOnly: true, expires: session.getDataValue('expires') }).status(200).json('Login successful.');
    //     return;
    //   } catch (error) {
    //     await transaction.rollback(); // Rollback the transaction in case of an error
    //     response.status(500).json({ code: 500, message: 'Something went wrong.', body: `${error}` }); // 500: Internal Server Error
    //     return;
    //   }
    // }
  }

  public getAuth(request: Request, response: Response): void {
    if (!response.locals.sessionId) {
      response.status(200).json({ code: 200, authenticated: false });
      return;
    }

    response.status(200).json({ code: 200, authenticated: true });
    return;
  }

  public getUser(request: Request, response: Response): void {
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'No user' }); // 401: Unauthorized
      return;
    }

    // TODO: Fetch real user data from the database using the userId

    const dummyUserObject = {
      name: 'Dummy User',
      street: 'Musterstr.',
      houseNumber: '21',
      city: 'Konstanz',
      zipCode: '78464',
      email: 'dummy@test.com',
    };

    response.status(200).json({ code: 200, user: dummyUserObject });
  }

  public updateUser(request: Request, response: Response): void {
    const userId = response.locals.userId;
    if (!userId) {
      response.status(401).json({ code: 401, message: 'No user' }); // 401: Unauthorized
      return;
    }

    // TODO: Update the user data in the database using the userId

    response.status(200).json({ code: 200, message: 'User data updated successfully'});
  }

  public async logout(request: Request, response: Response): Promise<void> {
    /* Check if the user has an active session */
    // const activeSession = await SessionManager.isValidSession(request.cookies.sessionId);
    if (!response.locals.sessionId) {
      console.log('No active Session');
      response.status(401).json({ code: 401, message: 'Not logged in' }); // 401: Unauthorized
      return;
    }

    /* Destroy the session */
    try {
      await UsersSession.destroy({ where: { id: request.cookies.sessionId } });
    } catch (error) {
      response.status(500).json({ code: 500, message: 'Something went wrong', body: `${error}` }); // 500: Internal Server Error
      return;
    }

    /* Clear the session cookie and send a success message */
    response.clearCookie('sessionId').status(200).json({ code: 200, message: 'Logout successful' });
    return;
  }
}
