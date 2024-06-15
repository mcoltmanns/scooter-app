import { DataTypes } from 'sequelize';
import Database from '../database';

export const RESERVATION_LIFETIME = 10 * 60 * 1000; // reservations expire after 10 minutes

export const Rental = Database.getSequelize().define('rentals', {
    // id is taken care of by sequelize
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
