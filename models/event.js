'use strict';
module.exports = (sequelize, DataTypes) => {
    var Event = sequelize.define('Event', {
        startdate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        enddate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

  Event.associate = function(models) {
    models.Event.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Event;
};