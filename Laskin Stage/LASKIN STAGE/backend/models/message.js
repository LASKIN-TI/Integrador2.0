'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    static associate(models) {
      // define association here
    }
  };
  message.init({
    url: DataTypes.STRING,
    token: DataTypes.STRING,
    time_noti: DataTypes.INTEGER,
    start_laboral: DataTypes.INTEGER,
    end_laboral: DataTypes.INTEGER,
    tel_responsable: DataTypes.STRING,
    template_name: DataTypes.STRING,
    template_nuevos: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'message',
    timestamps: false, 
  });
  return message;
};
