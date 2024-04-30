import { Model } from 'sequelize';
import uid from 'uid-safe';
import { SESSION_LIFETIME, UsersSession } from '../models/user';

abstract class SessionManager {
    /**
     * check if a session has expired
     * @param session   the session object to check
     * @returns         true or false if the session has expired or hasn't
     */
    public static async sessionExpired(session: Model): Promise<boolean> {
        const sessionExpireDate = new Date(session.getDataValue('expires'));
        if(sessionExpireDate < new Date()) {
            try {
                await session.destroy(); // Destroy the session if it has expired
            } catch (error) {
                console.log(error);
            }

            return true;
        }
        return false;
    }

    /**
     * Check if a user has a valid session
     * @param cookieSessionId    session id to check against
     * @param userAuthId         userAuthId to check against
     * @returns             true if it exists, false otherwise
     */
    public static async isValidSession(cookieSessionId: string, userAuthId?: string): Promise<boolean> {
        /* Check if no session id provided */
        if (!cookieSessionId) {
            return false;
        }

        /* Search for a session with the given session id and the optional user id */
        let session;
        try {
            if(userAuthId) {
                session = await UsersSession.findOne({ where: { id: cookieSessionId, usersAuthId: userAuthId } });
            } else {
                session = await UsersSession.findOne({ where: { id: cookieSessionId } });
            }
        } catch (error) {
            console.log(error);
        }

        /* Check if the session exists */
        if(!session) {
            return false;
        }

        /* Check if the session has expired */
        if(await SessionManager.sessionExpired(session)) {
            return false;
        }

        return true;
    }

    /**
     * Generate a new session in the context of a database transaction
     * @param userAuthId    id of the user for this session
     */
    public static async createSession(userAuthId: string): Promise<Model> {
        /* Generate a new session */
        const sessionId = uid.sync(24);   // Generates a uid of 32 characters
        const expiry = new Date(Date.now() + SESSION_LIFETIME);
        const sessionData = {
          id: sessionId,
          expires: expiry,
          usersAuthId: userAuthId,
        };

        /* Save the new session to the database */
        let newSession;
        try {
            newSession = await UsersSession.create(sessionData); // save the new session
        } catch (error) {
            console.log(error);
        }

        return newSession;
    }
}

export default SessionManager;