import { DataTypes } from 'sequelize';

export const USER_ATTRIBS = {
    id: { // uid is the primary key
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // users must have an email, and it must be unique
        unique: true
    },
    password: {
        type: DataTypes.STRING, // should under no circumstances ever be plaintext!
        allowNull: false // users must have a password
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false // users must have a first name
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false // users must have a last name
    }
};