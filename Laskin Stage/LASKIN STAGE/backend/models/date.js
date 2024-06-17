'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class date extends Model {
    static associate(models) {
      // define association here
    }
  };
  date.init({
    date_hw: DataTypes.STRING,
    date_rabbit: DataTypes.STRING,
    state: DataTypes.STRING,
    responsible: DataTypes.STRING,
    qty: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'date',
    timestamps: false, 
  });
  return date;
};
