import Database from '../database';
import { DataTypes } from 'sequelize';
import { UsersAuth } from './user';
import { ActiveRental, PastRental } from './rental';

export const PaymentMethod = Database.getSequelize().define('usersPaymentMethods', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['bachelorcard', 'swpsafe', 'hcipal']],
          msg: 'The payment type must be either \'bachelorcard\', \'swpsafe\', or \'hcipal\'.'
        }
      }
    },
    data: {
      type: DataTypes.JSONB, // payment methods are stored as json blobs
      allowNull: false,
    }
}, {
  createdAt: false,
  updatedAt: false
});

UsersAuth.hasMany(PaymentMethod, {
  foreignKey: {
      name: 'usersAuthId',
      allowNull: false,
  }
});
PaymentMethod.belongsTo(UsersAuth, {
  foreignKey: {
    name: 'usersAuthId',
    allowNull: false,
  }
});

PaymentMethod.hasMany(PastRental, { // every rental uses one payment method
  foreignKey: {
    name: 'paymentMethodId',
    allowNull: false
  }
}); // payment methods can be used on multiple rentals
PastRental.belongsTo(PaymentMethod, { // every rental uses one payment method
  foreignKey: {
    name: 'paymentMethodId',
    allowNull: false
  }
});
PaymentMethod.hasMany(ActiveRental, { // every rental uses one payment method
  foreignKey: {
    name: 'paymentMethodId',
    allowNull: false
  }
});
ActiveRental.belongsTo(PaymentMethod, {
  foreignKey: {
    name: 'paymentMethodId',
    allowNull: false
  }
});
