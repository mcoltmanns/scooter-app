import Database from '../database';
import { DataTypes } from 'sequelize';
import { Scooter } from './scooter';
import { UsersAuth } from './user';

/**
 * model for a scooter rental - links a customer to a given scooter
 */

export const Rental = Database.getSequelize().define('rentals', {
    id: { // every rental has an id
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true,
    },
    start: { // when did this rental start?
        type: DataTypes.DATE,
        allowNull: false
    },
    end: { // when did this rental end? null if rental isn't closed out yet
        type: DataTypes.DATE,
        allowNull: true
    },
});
Rental.belongsTo(UsersAuth, { // which user rented?
    foreignKey: 'user_id'
});
Rental.hasOne(Scooter, { // which scooter was rented?
    foreignKey: 'rental_id'
});
