import { DataTypes } from 'sequelize';
import Database from '../database';

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
