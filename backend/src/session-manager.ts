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
     * @param userAuthId    userAuthId to find a valid session for
     * @returns             the session if it exists, null otherwise
     */
    public static async hasValidSession(userAuthId: string): Promise<Model> {
        console.log('looking for a session...');
        const session = await UsersSession.findOne({ where: { usersAuthId: userAuthId } });
        if(session) {
            const expires: Date = session.getDataValue('expires');
            if(expires && expires < new Date) { // check if the session expired
                session.destroy(); // did it? get rid of it
                return null;
            }
            else return session;
        }
        else return null;
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
    public static async createSession(userAuthId: string, transaction: Transaction): Promise<Model> {
        // generate a new session
        const sessionId = uid.sync(24);
        const expiry = new Date(Date.now() + SESSION_LIFETIME);
        const sessionData = {
          id: sessionId,
          expires: expiry,
          usersAuthId: userAuthId,
        };
        return await UsersSession.create(sessionData, { transaction }); // save the new session
    }
}

export default SessionManager;