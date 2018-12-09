var utils = require('../utils')
  , models = require('../models/index.js');

module.exports = {
    getDash: function (req, res) {
      if (req.session.user && req.cookies.user_sid) {

        var thisWeek = utils.getThisWeek();
        console.log("thisWeek: " + thisWeek);

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
    },
    getDatedDash: function (req, res) {
      if (req.session.user && req.cookies.user_sid) {
        if (req.params.date) {
          var thisWeek = utils.getWeekFromDate(req.params.date)
        } else {
          res.redirect("/dashboard");
        }
        console.log("req.params.date: " + req.params.date);
        console.log("thisWeek: " + thisWeek);

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
}