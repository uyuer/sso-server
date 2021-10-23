'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Client.init({
    name: {
      comment: "系统名",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    alias: {
      comment: "系统别名",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    token: {
      comment: "认证token",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    origin: {
      comment: "系统地址",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    allowe: {
      comment: "是否允许登录",
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    remark: {
      comment: "备注",
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Client',
  });
  return Client;
};