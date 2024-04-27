import { DataTypes } from 'sequelize';
import Database from '../database';
import { UsersAuth } from './user';

export const SESSION_LIFETIME = 60 * 60 * 1000;

/**
 * table of all active sessions - associate user ids and session tokens
 */
export const UsersSession = Database.getSequelize().define('usersSession', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    expires: {
        type: DataTypes.DATE, // all sessions must expire
        allowNull: false,
    }
}, { updatedAt: false, createdAt: false });

UsersSession.hasOne(UsersAuth, { // sessions have exactly one user
    foreignKey: {
        name: 'usersSessionId',
        allowNull: true, // users aren't always logged in
    }
});
UsersAuth.hasMany(UsersSession, { // but users may have many simultaneous sessions
    foreignKey: {
        name: 'usersAuthId',
        allowNull: false, // every session must have a user
    }
});