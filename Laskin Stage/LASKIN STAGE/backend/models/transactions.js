'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    static associate(models) {
      // Define association here
    }
  }

  transaction.init({
    order_id: {type:DataTypes.BIGINT, primaryKey:true},
    id_transaction:DataTypes.BIGINT,
    gateway: DataTypes.STRING,
    payment_id: DataTypes.STRING,
    amount: DataTypes.STRING
    
  }, {
    sequelize,
    modelName: 'transaction',
    timestamps: false,
  });

  return transaction;
};
