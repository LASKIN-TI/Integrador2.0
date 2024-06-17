'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class state extends Model {
    static associate(models) {
      // Define association here
    }
  }

  state.init({
    value:DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'state',
    timestamps: false,
  });

  return state;
};
