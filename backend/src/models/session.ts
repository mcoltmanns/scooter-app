import { DataTypes } from 'sequelize';
import Database from '../database';
import { UsersAuth } from './user';

export const SESSION_LIFETIME = 60 * 60 * 1000; // sessions expire after 1 hour

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

UsersAuth.hasMany(UsersSession, { // users may have many sessions
    foreignKey: {
        name: 'usersAuthId',
        allowNull: false, // every session must have a user
    }
});
UsersSession.belongsTo(UsersAuth, {
    foreignKey: {
      name: 'usersAuthId',
      allowNull: false,
    },
  });