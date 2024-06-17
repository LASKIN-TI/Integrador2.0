'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class city extends Model {
    static associate(models) {
      // define association here
    }
  };
  city.init({
    id_department: DataTypes.STRING,
    id_city: DataTypes.STRING,
    desc_department: DataTypes.STRING,
    desc_city: DataTypes.STRING,
    city: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'city',
    timestamps: false, 
  });
  return city;
};
