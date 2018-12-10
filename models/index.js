'use strict';

/**
* auto generated index by sequelize
* loads in each model file found into the db variable which we then export for later use
**/

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var db        = {};

if (process.env.DATABASE_URL) {
  var sequelize = new Sequelize(process.env.DATABASE_URL, {
      "dialect":  'postgres',
      "protocol": 'postgres',
      "ssl": true,
        "dialectOptions": {
            "ssl": true
        }
    });
} else {
  var config    = require(__dirname + '/../config.js')[env];
  var sequelize = new Sequelize('postgres://' + config.database.user + '@' + config.database.host + ':5432/' + config.database.db);
}
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;