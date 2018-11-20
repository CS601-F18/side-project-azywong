'use strict';
module.exports = (sequelize, DataTypes) => {
    var Todo = sequelize.define('Todo', {
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
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