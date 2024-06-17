'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class record extends Model {
    static associate(models) {
    }
  };
  record.init({
    response_status: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    product_id: DataTypes.BIGINT,
    sku:DataTypes.STRING,
    title: DataTypes.STRING,
    product_type: DataTypes.STRING,
    body_html: DataTypes.STRING,
    vendor: DataTypes.STRING,
    status: DataTypes.STRING,
    price: DataTypes.STRING,
    compare_at_price: DataTypes.STRING,
    tags: DataTypes.STRING,
    inventory_policy: DataTypes.STRING,
    inventory_management: DataTypes.STRING,
    inventory_quantity: DataTypes.INTEGER,
    requires_shipping: DataTypes.BOOLEAN,
    message: DataTypes.STRING,
    date_crea: DataTypes.STRING,
    date_act: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'record'
    });
  return record;
};