import { DataTypes } from 'sequelize';
import Database from '../database';

// table for rentals currently going on
export const ActiveRental = Database.getSequelize().define('activeRentals', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
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
    },
    total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0,
        }
    },
    lastPaymentToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentOffset: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
}, { updatedAt: true, createdAt: true });

// table for finished/closed out rentals
export const PastRental = Database.getSequelize().define('pastRentals', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      // Do not autoIncrement here since the ID should be carried over from ActiveRental
    },
    endedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    price_per_hour: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0,
        }
    },
    total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
            min: 0,
        }
    },
    paymentOffset: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
}, { updatedAt: false, createdAt: true });

export const Reservation = Database.getSequelize().define('reservations', {
    endsAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {updatedAt: false, createdAt: false});
