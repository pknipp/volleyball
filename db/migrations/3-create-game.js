'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Games", {
      id: {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER},
      ownerId: {allowNull: false, type: Sequelize.INTEGER, onDelete: 'CASCADE', references: {model: "Users"}},
      gameTypeId: {allowNull: false, type: Sequelize.INTEGER, onDelete: 'CASCADE', references: {model: "GameTypes"}},
      address: {allowNull: false, type: Sequelize.TEXT},
      extraInfo: {type: Sequelize.TEXT},
      dateTime: {type: Sequelize.DATE, allowNull: false},
      ...['minSkill', 'maxSkill'].reduce((pojo, key) => {
        return ({...pojo, [key]: {allowNull: false, type: Sequelize.INTEGER}});
      }, {}),
      ...["createdAt", "updatedAt"].reduce((pojo, key) => {
        return ({...pojo, [key]: {allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW")}});
      }, {})
    });
  },
  down: queryInterface => queryInterface.dropTable('Games')
};