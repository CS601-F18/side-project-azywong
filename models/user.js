'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

  User.associate = function(models) {
    models.User.hasMany(models.Todo);
    models.User.hasMany(models.Event);
  };

  return User;
};