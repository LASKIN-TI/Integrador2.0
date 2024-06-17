'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stock_dates extends Model {
    static associate(models) {
      // define association here
    }
  };
  stock_dates.init({
    action: DataTypes.STRING,
    responsible: DataTypes.STRING,
    date: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'stock_dates',
    timestamps: false, 
  });
  return stock_dates;
};
