import { DataTypes } from 'sequelize';
import Database from '../database';

export const RESERVATION_LIFETIME = 10 * 60 * 1000; // reservations expire after 10 minutes

export const Rental = Database.getSequelize().define('rentals', {
    id: { // rental id
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, //increment the Rental id
    },
    endedAt: { // rentals are only over if endedAt contains a value
        type: DataTypes.DATE,
        allowNull: true,
    },
}, { updatedAt: false, createdAt: true}); // use createdAt to track when the rental began

export const Reservation = Database.getSequelize().define('reservations', {
    endsAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {updatedAt: false, createdAt: false});
