'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    static associate(models) {
      // Define association here
    }
  }

  product.init({
    product_id: {type:DataTypes.BIGINT, primaryKey:true},
    sku:DataTypes.STRING,
    title: DataTypes.STRING,
    product_type: DataTypes.STRING,
    inventory_item_id: DataTypes.BIGINT,
    body_html: DataTypes.STRING,
    vendor: DataTypes.STRING,
    status: DataTypes.STRING,
    price: DataTypes.FLOAT,
    compare_at_price: DataTypes.FLOAT,
    tags: DataTypes.STRING,
    inventory_policy: DataTypes.STRING,
    inventory_management: DataTypes.STRING,
    inventory_quantity: DataTypes.INTEGER,
    requires_shipping: DataTypes.BOOLEAN,
    published_at: DataTypes.STRING,
    taxable: DataTypes.BOOLEAN,
    barcode: DataTypes.STRING,
    weight: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'product',
    timestamps: false,
  });

  return product;
};
