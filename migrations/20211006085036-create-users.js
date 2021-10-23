'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        comment: "用户邮箱",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      username: {
        comment: "用户名",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      password: {
        comment: "密码",
        allowNull: false,
        type: Sequelize.STRING,
      },
      male: {
        comment: "性别[0:女,1:男,2:保密](默认2)",
        allowNull: false,
        defaultValue: "2",
        type: Sequelize.ENUM('0', '1', '2'),
      },
      status: {
        comment: "账户状态[0:正常,1:冻结](默认0)",
        allowNull: false,
        defaultValue: "0",
        type: Sequelize.ENUM('0', '1', '2'),
      },
      role: {
        comment: "角色[0:普通用户,1:系统管理员](默认0)",
        allowNull: false,
        defaultValue: "0",
        type: Sequelize.ENUM('0', '1', '2'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User');
  }
};