'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      ownerId: {allowNull: false, type: DataTypes.INTEGER},
      ...['minSkill', 'maxSkill'].reduce((pojo, key) => {
        return ({...pojo, [key]: {allowNull: false, type: DataTypes.INTEGER}});
      }, {}),
      address: {allowNull: false, type: DataTypes.TEXT},
      extraInfo: {allowNull: true, type: DataTypes.TEXT},
      dateTime: {allowNull: false, type: DataTypes.DATE}
    },
  );

  Game.associate = function(models) {
    Game.belongsTo(models.User, {foreignKey: 'ownerId', onDelete: 'CASCADE'});
    Game.hasMany(models.Reservation, {foreignKey: 'gameId'});
  };

  return Game;
};
