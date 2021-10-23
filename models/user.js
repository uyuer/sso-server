'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    email: {
      comment: "用户邮箱",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    username: {
      comment: "用户名",
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    password: {
      comment: "密码",
      allowNull: false,
      type: DataTypes.STRING,
    },
    male: {
      comment: "性别[0:女,1:男,2:保密](默认2)",
      allowNull: false,
      defaultValue: "2",
      type: DataTypes.ENUM('0', '1', '2'),
    },
    status: {
      comment: "账户状态[0:正常,1:冻结](默认0)",
      allowNull: false,
      defaultValue: "0",
      type: DataTypes.ENUM('0', '1', '2'),
    },
    role: {
      comment: "角色[0:普通用户,1:系统管理员](默认0)",
      allowNull: false,
      defaultValue: "0",
      type: DataTypes.ENUM('0', '1', '2'),
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};