var utils = require('../utils')
  , models = require('../models/index.js');

/**
* controller that handlers the routes for dashboard
**/
var controller = {};

/**
* method that renders this week's dashboard
**/
controller.getDash = function (req, res) {
  if (req.session.user && req.cookies.user_sid) {

    var thisWeek = utils.getThisWeek();

    models.Todo.findAll({ where: { UserId: req.session.user } }).then(function (todos) {
      models.Event.findAll(
        { where:
          { UserId: req.session.user,
            startdate: {
              [models.Sequelize.Op.gte]: thisWeek[0],
              [models.Sequelize.Op.lte]: thisWeek[6]
            }
          }
      }).then(function(events) {
        var orderedEvents = utils.orderEvents(events, thisWeek);
        var orderedTodos = utils.orderTodos(todos);
        res.render('dashboard', { authenticated: true, todos: orderedTodos, events: orderedEvents, error: req.query.error});
      })
    });
  } else {
      res.redirect('/login');
  }
}

/**
* method that renders a specific week's dashboard
**/
controller.getDatedDash = function (req, res) {
  if (req.session.user && req.cookies.user_sid) {
    if (req.params.date) {
      var thisWeek = utils.getWeekFromDate(req.params.date);
    } else {
      res.redirect("/dashboard");
    }

    models.Todo.findAll({ where: { UserId: req.session.user } }).then(function (todos) {
      models.Event.findAll(
        { where:
          { UserId: req.session.user,
            startdate: {
              [models.Sequelize.Op.gte]: thisWeek[0],
              [models.Sequelize.Op.lte]: thisWeek[6]
            }
          }
      }).then(function(events) {
        var orderedEvents = utils.orderEvents(events, thisWeek);
        var orderedTodos = utils.orderTodos(todos);
        res.render('dashboard', { authenticated: true, todos: orderedTodos, events: orderedEvents, error: req.query.error});
      })
    });
  } else {
      res.redirect('/login');
  }
}

module.exports = controller;