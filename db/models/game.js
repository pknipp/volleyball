'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      ...['ownerId', 'minSkill', 'maxSkill'].reduce((pojo, key) => {
        return ({...pojo, [key]: {allowNull: false, type: DataTypes.INTEGER}});
      }, []),
      ...['address', 'extraInfo'].reduce((pojo, key) => {
        return ({...pojo, [key]: {allowNull: false, type: DataTypes.TEXT}});
      }, []),
      dateTime: {allowNull: false, type: DataTypes.DATE}
    },
  );

  Game.associate = function(models) {
    Game.belongsTo(models.User, {as: 'owner'});
    Game.hasMany(models.Reservation);
  };

  return Game;
};
