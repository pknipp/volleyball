'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(255),
        unique: true,
      },
      nickName: {
        allowNull: false,
        type: Sequelize.STRING(32),
        unique: true
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING(32),
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING(32),
      },
      cell: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      skill: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      photo: {
        type: Sequelize.TEXT,
      },
      tokenId: {
        type: Sequelize.STRING(36),
      },
      hashedPassword: {
        allowNull: false,
        type: Sequelize.STRING(60).BINARY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Users');
  }
};
