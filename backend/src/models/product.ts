import Database from '../database';
import { DataTypes } from 'sequelize';

/**
 * model for a scooter and its product info: rates, description, etc
 */
export const Product = Database.getSequelize().define('products', {
    id: { // do we need this? product_id seems to also act as a primary key
        type: DataTypes.INTEGER,
        //autoIncrement: true, // FIXME: why error here? "type serial does not exist" when syncing database tables
        allowNull: false,
        unique: true,
    },
    name: { // product names are primary key
        type: DataTypes.STRING,
        primaryKey: true,
    },
    brand: { // brands are non-unique and non-null
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: { // images are any string TODO: possible validations?
        type: DataTypes.STRING,
    },
    max_reach: {
        type: DataTypes.REAL,
    },
    max_speed: {
        type: DataTypes.REAL,
    },
    price_per_hour: {
        type: DataTypes.DECIMAL, //TODO: proper data type?
        allowNull: false,
        validate: {
            min: 0,
        }
    }
}, { createdAt: false, updatedAt: false });
