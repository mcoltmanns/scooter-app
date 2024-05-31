import Database from '../database';
import { DataTypes } from 'sequelize';
import { UsersAuth } from './user';

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
