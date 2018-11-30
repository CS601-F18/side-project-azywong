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
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordExpires: {
          type: DataTypes.DATE,
          allowNull: true
        }
    });

  User.associate = function(models) {
    models.User.hasMany(models.Todo);
    models.User.hasMany(models.Event);
  };

  return User;
};