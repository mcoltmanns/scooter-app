import Database from '../database';
import { DataTypes } from 'sequelize';
import { UsersData } from './user';

/**
 * store payment methods
 */
export const PaymentMethod = Database.getSequelize().define('paymentMethod', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    info: {
        type: DataTypes.JSONB, // payment methods are stored as json blobs
        allowNull: false,
    }
});

PaymentMethod.belongsTo(UsersData);
UsersData.hasMany(PaymentMethod);
