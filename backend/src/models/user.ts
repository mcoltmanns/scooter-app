import Database from '../database';
import { DataTypes } from 'sequelize';
import { Rental } from './rental';

export const SESSION_LIFETIME = 60 * 60 * 1000; // sessions expire after 1 hour

export const UsersAuth = Database.getSequelize().define('usersAuths', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  createdAt: false,
  updatedAt: false
});

export const UsersData = Database.getSequelize().define('usersDatas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  houseNumber: { 
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  zipCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  createdAt: false,
  updatedAt: false
});

export const UsersSession = Database.getSequelize().define('usersSession', {
  id: {
      type: DataTypes.STRING,
      primaryKey: true,
  },
  expires: {
      type: DataTypes.DATE,
      allowNull: false,
  }
}, { updatedAt: false, createdAt: false });

UsersAuth.hasOne(UsersData, {
  foreignKey: {
    name: 'usersAuthId',
    allowNull: false,
  },
});
UsersData.belongsTo(UsersAuth, {
  foreignKey: {
    name: 'usersAuthId',
    allowNull: false,
  },
});

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

UsersAuth.hasOne(Rental, {
  foreignKey: {
    name: 'user_id',
    allowNull: false // rentals must have an associated user
  },
});
// users table doesn't need to track rentals - rentals table does this for us

export const UserPreferences = Database.getSequelize().define('userPreferences', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  speed: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  distance: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  createdAt: false,
  updatedAt: false
});