import Database from '../database';
import { DataTypes } from 'sequelize';
import { Product } from './product';
import { ActiveRental, PastRental, Rental, Reservation } from './rental';

/**
 * model of an actual instance of a scooter - these scooters really exist!
 */

export const Scooter = Database.getSequelize().define('scooters', {
    id: { // scooter id
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // this id serves to uniquely identify this scooter instance
    },
    product_id: { // what model does this scooter have? - foreign key for products TODO: does it make sense to have this be a string? should we use integer types?
        type: DataTypes.STRING,
        allowNull: false,
    },
    battery: { // how much battery is left?
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            min: 0,
            max: 100,
        },
    },
    coordinates_lat: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: { // openstreetmaps latitude range
            min: -90,
            max: 90,
        },
    },
    coordinates_lng: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: { // openstreetmaps longitude range
            min: -180,
            max: 180,
        },
    }
}, { updatedAt: false, createdAt: false });

Scooter.belongsTo(Product, { // establish foreign key relation - every real scooter is an instance of a product
    foreignKey: 'product_id', // and products and scooters are related via product ids
});
Product.hasMany(Scooter, { // each product has many scooters
    foreignKey: 'product_id', // and products and scooters are related via product ids
});

Scooter.hasOne(Rental, { // every scooter can have a rental 
    foreignKey: {
        name: 'scooter_id',
        allowNull: false // rentals must have an associated scooter
    },
});
Rental.hasOne(Scooter, { // every rental can have a scooter - if a scooter's active_rental_id is null, it isn't being rented out
    foreignKey: {
        name: 'active_rental_id',
        allowNull: true // scooters don't need to always be rented
    },
});

Scooter.hasMany(PastRental, { // past rentals belong to one scooter
    foreignKey: {
        name: 'scooterId',
        allowNull: false
    }
}); // scooters can have many past rentals
PastRental.belongsTo(Scooter, { // past rentals belong to one scooter
    foreignKey: {
        name: 'scooterId',
        allowNull: false
    }
});
Scooter.hasOne(ActiveRental, { // past rentals belong to one scooter
    foreignKey: {
        name: 'scooterId',
        allowNull: false
    }
}); // scooters can have one active rental
ActiveRental.belongsTo(Scooter, { // active rentals belong to one scooter
    foreignKey: {
        name: 'scooterId',
        allowNull: false
    }
});

Reservation.hasOne(Scooter, {
    foreignKey: {
        name: 'reservation_id',
        allowNull: true // every reservation has a scooter
    }
});
Scooter.hasOne(Reservation, {
    foreignKey: {
        name: 'scooter_id',
        allowNull: true // scooters aren't always reserved
    }
});
