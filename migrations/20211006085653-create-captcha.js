'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Captcha', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        comment: "用户邮箱",
        allowNull: false,
        type: Sequelize.STRING,
      },
      code: {
        comment: "用户邮箱",
        allowNull: false,
        type: Sequelize.STRING,
      },
      expires: {
        comment: "过期时间时间戳",
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      expiresTime: {
        comment: "过期时间",
        allowNull: false,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Captcha');
  }
};