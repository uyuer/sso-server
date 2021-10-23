'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Captcha extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Captcha.init({
    email: {
      comment: "用户邮箱",
      allowNull: false,
      type: DataTypes.STRING,
    },
    code: {
      comment: "用户邮箱",
      allowNull: false,
      type: DataTypes.STRING,
    },
    expires: {
      comment: "过期时间时间戳",
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    expiresTime: {
      comment: "过期时间",
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Captcha',
  });
  return Captcha;
};