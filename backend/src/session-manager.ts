import { Model, Transaction } from 'sequelize';
import uid from 'uid-safe';
import { SESSION_LIFETIME, UsersSession } from './models/session';

abstract class SessionManager {
    /**
     * check if a session has expired
     * @param session   the session to check
     * @returns         true false or null if the session has expired, hasn't, or doesn't exist
     */
    public static async sessionExpired(sessionId: string): Promise<boolean> {
        const session = await UsersSession.findOne({ where: { id: sessionId } });
        if(session) {
            const expires: Date = session.getDataValue('expires');
            if(expires && expires < new Date) { // check if the session expired
                session.destroy(); // did it? get rid of it
                return true;
            }
            else return false;
        }
        else return null;
    }

    /**
     * Check if a user has a valid session
     * @param cookieSessionId    session id to check against
     * @param userAuthId         userAuthId to check against
     * @returns             true if it exists, false otherwise
     */
    public static async hasValidSession(cookieSessionId: string, userAuthId: string): Promise<boolean> {
        /* Check if no session id or user id provided */
        if (!cookieSessionId || !userAuthId) {
            return false;
        }

        /* Search for a session with the given session id and user id */
        let session;
        try {
            session = await UsersSession.findOne({ where: { id: cookieSessionId, usersAuthId: userAuthId } });
        } catch (error) {
            console.log(error);
        }

        /* Check if the session exists */
        if(!session) {
            return false;
        }

        /* Check if the session has expired */
        const sessionExpires = new Date(session.getDataValue('expires'));
        console.log(`Session expires at ${sessionExpires} and now is ${new Date()}`);
        if(sessionExpires < new Date()) {
            console.log('Session expired');
            try {
                await session.destroy(); // Destroy the session if it has expired
            } catch (error) {
                console.log(error);
            }

            return false;
        }
        
        return true;
    }

    /**
     * Renew a session (reset its expiration)
     * @param sessionId the id of the session to renew
     */
    public static async renewSession(sessionId: string): Promise<void> {
        const session = await UsersSession.findOne({ where: { id: sessionId } });
        if(!session) return; // stop if we can't find a session
        session.setDataValue('expires', new Date(Date.now() + SESSION_LIFETIME));
    }

    /**
     * Generate a new session in the context of a database transaction
     * @param userAuthId    id of the user for this session
     */
    public static async createSession(userAuthId: string): Promise<Model> {
        /* Generate a new session */
        const sessionId = uid.sync(24);
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