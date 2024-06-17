'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class order_items extends Model {
    static associate(models) {
      // Definir la relación inversa con 'order'
      order_items.belongsTo(models.order, { foreignKey: 'order_ref' });
    }
  }

  order_items.init(
    {
      order_ref: DataTypes.BIGINT,
      product_id: DataTypes.STRING,
      sku: DataTypes.STRING,
      order_item_name: DataTypes.STRING,
      pa_sucursal: DataTypes.STRING,
      unitario_coniva: DataTypes.STRING,
      valor_dcto: DataTypes.BIGINT,
      valor_bruto: DataTypes.BIGINT, 
      qty: DataTypes.INTEGER,
      line_total: DataTypes.BIGINT, 
      cupon_hw: DataTypes.BIGINT, 
      cupon_ue: DataTypes.BIGINT, 
    },
    {
      sequelize,
      modelName: 'order_items',
      timestamps: false,
    }
  );

  return order_items;
};
