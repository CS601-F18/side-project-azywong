var models = require('../models/index.js')

/**
* controller that handlers the routes for calendar events
**/
var controller = {};

/**
* method that happens before all routes, middleware
**/
controller.all = function (req, res, next) {
	if (req.session.user && req.cookies.user_sid && req.body) {
      next();
    } else {
      var error = "missing request body"
      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
    }
}

/**
* method that handles post requests and creates new event
**/
controller.post =  function (req, res) {
	if (req.body.startdate && req.body.enddate && req.body.title) {
      if( req.body.startdate <= req.body.enddate) {
        models.Event.create({
          startdate: req.body.startdate,
          enddate: req.body.enddate,
          title: req.body.title,
          UserId: req.session.user
        })
        .then(message => {
          res.redirect(req.headers.referer);
        })
        .catch(error => {
          res.redirect(req.headers.referer + "?error=" + encodeURIComponent(error));
        });
      } else {
        var error = "startdate must be after end date!"
        res.redirect(req.headers.referer + "?error=" + encodeURIComponent(error));
      }
    } else {
      var error = "invalid parameters"
      res.redirect(req.headers.referer + "?error=" + encodeURIComponent(error));
    }
}

/**
* method that handles deletion of an event
**/
controller.delete = function (req, res) {
	if (req.body.id) {
      models.Event.destroy({
        where: {
          id: req.body.id,
          UserId: req.session.user
        }
      })
      .then(message => {
        res.json( { message: message } );
      })
      .catch(error => {
        res.json( { error: "error deleting", message: error } );
      });
    } else {
      res.json( { error: "error missing inputs" } );
    }
}

module.exports = controller;