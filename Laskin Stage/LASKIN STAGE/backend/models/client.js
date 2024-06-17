'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  client.init({
    tipo_persona: DataTypes.STRING,
    nombre_1: DataTypes.STRING,
    nombre_2: DataTypes.STRING,
    apellido_1:DataTypes.STRING,
    apellido_2:DataTypes.STRING,
    tipo_doc:DataTypes.STRING,
    doc:DataTypes.STRING,
    celular_1:DataTypes.STRING,
    celular_2:DataTypes.STRING,
    email:DataTypes.STRING,
    direccion:DataTypes.STRING,
    ciudad:DataTypes.STRING,
    pais:DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'client',
    timestamps: false,
  });
  return client;
};