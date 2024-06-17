'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inventory extends Model {
    static associate(models) {
      // define association here
    }
  };
  inventory.init({
    name: DataTypes.STRING,
    location_id_reference: DataTypes.STRING,
    available_reference: DataTypes.INTEGER,
    sku: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'inventory',
    timestamps: false, 
  });
  return inventory;
};
