'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dispatch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  dispatch.init({
    country: DataTypes.STRING,
    department: DataTypes.STRING,
    city: DataTypes.STRING,
    geolocation:DataTypes.BOOLEAN,
    location: DataTypes.STRING,
    id_sucursal: DataTypes.INTEGER,
    id_bodega: DataTypes.INTEGER,
    lat: DataTypes.STRING,
    lng: DataTypes.STRING,
    location_default: DataTypes.STRING,
    id_sucursal_default: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'dispatch',
    timestamps: false,
  });
  return dispatch;
};