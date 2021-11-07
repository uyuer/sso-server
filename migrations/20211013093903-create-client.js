'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Client', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        comment: "系统名",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      alias: {
        comment: "系统别名",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      token: {
        comment: "认证token",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      origin: {
        comment: "系统地址",
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      allowe: {
        comment: "是否允许登录",
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      remark: {
        comment: "备注",
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Client');
  }
};