import { DataTypes } from 'sequelize';
import Database from '../database';

export const Rental = Database.getSequelize().define('rentals', {
    // id is taken care of by sequelize
    endedAt: { // rentals are only over if endedAt contains a value
        type: DataTypes.DATE,
        allowNull: true,
    },
}, { updatedAt: false, createdAt: true}); // use createdAt to track when the rental began

// table for rentals currently going on
export const ActiveRental = Database.getSequelize().define('activeRentals', {
    nextActionTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    price_per_hour: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0,
        }
    }
}, { updatedAt: true, createdAt: true });

// table for finished/closed out rentals
export const PastRental = Database.getSequelize().define('pastRentals', {
    endedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0,
        }
    }
}, { updatedAt: false, createdAt: true });

export const Reservation = Database.getSequelize().define('reservations', {
    endsAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {updatedAt: false, createdAt: false});
