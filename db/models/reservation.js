'use strict';
const {Model, INTEGER} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define("Reservation",
    {
      ...['playerId','eventId'].reduce((pojo, fk) => {
        return {...pojo, [fk]: {type: DataTypes.INTEGER, allowNull: false}};
      }, {}),
      bools: {type: DataTypes.TEXT, allowNull: false, defaultValue: JSON.stringify({})}},
      // bools: {allowNull: false, defaultValue: 0, type: DataTypes.INTEGER},
      ['Extra info']: {allowNull: true, type: DataTypes.TEXT},
    },
  );

  Reservation.associate = function(models) {
    Reservation.belongsTo(models.Event, {foreignKey: 'eventId', onDelete: 'CASCADE'});
    Reservation.belongsTo(models.User, {foreignKey: 'playerId', onDelete: 'CASCADE'});
  };

  return Reservation;
};
