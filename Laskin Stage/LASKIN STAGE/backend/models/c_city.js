'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class c_city extends Model {
    static associate(models) {
      // define association here
    }
  };
  c_city.init({
    id_department: DataTypes.STRING,
    id_city: DataTypes.STRING,
    desc_department: DataTypes.STRING,
    desc_city: DataTypes.STRING,
    city: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'c_city',
    timestamps: false, 
  });
  return c_city;
};
