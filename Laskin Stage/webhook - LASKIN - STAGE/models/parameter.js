'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class parameter extends Model {
    static associate(models) {
    }
  };
  parameter.init({
    token: DataTypes.STRING,
    value:DataTypes.INTEGER,
    name:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'parameter',
    timestamps: false,
  });
  return parameter;
};