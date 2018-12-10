'use strict';
/**
* model that represents a todo item in the application
**/
module.exports = (sequelize, DataTypes) => {
    var Todo = sequelize.define('Todo', {
        checked: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

  Todo.associate = function(models) {
    models.Todo.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Todo;
};