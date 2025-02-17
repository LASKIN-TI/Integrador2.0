'use strict';
const { Model, STRING } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    static associate(models) {
      // Definir la relación de uno a muchos con 'order_items'
      this.hasMany(models.order_items, { foreignKey: 'order_ref' });
    }

  }

  order.init(
    {
    order_ref:{type:DataTypes.BIGINT,primaryKey:true},
    id_shopify: DataTypes.STRING,
    order_date: DataTypes.STRING,
    order_modified: DataTypes.STRING,
    order_status: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    customer_ip_address: DataTypes.STRING,
    customer_user: DataTypes.BIGINT,
    billing_cedula: DataTypes.STRING,
    billing_first_name: DataTypes.STRING,
    billing_last_name: DataTypes.STRING,
    billing_email: DataTypes.STRING,
    billing_phone: DataTypes.STRING,
    billing_address_1: DataTypes.STRING,
    billing_address_2: DataTypes.STRING,
    billing_city: DataTypes.STRING,
    billing_typedcity: STRING,
    billing_zona: DataTypes.STRING,
    billing_state: DataTypes.STRING,
    billing_country: DataTypes.STRING,
    shipping_first_name: DataTypes.STRING,
    shipping_last_name: DataTypes.STRING,
    shipping_address_1: DataTypes.STRING,
    shipping_address_2: DataTypes.STRING,
    shipping_city: DataTypes.STRING,
    shipping_typedcity: DataTypes.STRING,
    shipping_zona: DataTypes.STRING,
    shipping_state: DataTypes.STRING,
    shipping_country: DataTypes.STRING,
    order_total: DataTypes.BIGINT,
    order_shipping: DataTypes.BIGINT,
    shipping_notes: DataTypes.STRING,
    state: DataTypes.INTEGER,
    cupon_code: DataTypes.STRING,
    code: DataTypes.STRING,
    message: DataTypes.STRING,
    status_hook: DataTypes.INTEGER,
    order_id: DataTypes.STRING,
    location: DataTypes.STRING,
    branch_description: DataTypes.STRING,
    branch_id: DataTypes.INTEGER,
    lat: DataTypes.STRING,
    lng: DataTypes.STRING,
    mensaje: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'order',
      timestamps: false,
    }
  );

  return order;
};
