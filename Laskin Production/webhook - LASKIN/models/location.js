'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class location extends Model {
    static associate(models) {
      // define association here
    }
  };
  location.init({
    name: DataTypes.STRING,
    location_id_reference: DataTypes.INTEGER,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    default: DataTypes.BOOLEAN,
    no_stock: DataTypes.BOOLEAN,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    start_laboral: DataTypes.INTEGER,
    end_laboral: DataTypes.INTEGER,
    tel_sede: DataTypes.STRING,
    template_name: DataTypes.STRING,
    id_sucursal: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'location',
    timestamps: false, 
  });
  return location;
};
