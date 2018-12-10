var models = require('../models/index.js')

/**
* controller that handlers the routes for todo
**/

var controller = {};

/**
* middleware that checks before all requests to this route
**/
controller.all = function (req, res, next) {
	if (req.session.user && req.cookies.user_sid && req.body) {
      next();
    } else {
      var error = "not authenticated or missing req.body"
      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
    }
}

/**
* updates todo item
**/
controller.put =  function (req, res) {
	if (req.body.id && req.body.checked) {
      models.Todo.update({
        checked: req.body.checked
      },{
        where: {
          id: req.body.id,
          UserId: req.session.user
        }
      })
      .then(message => {
        res.json( { message: message } );
      })
      .catch(error => {
        res.json( { error: "error entering in db", message: error } );
      });
    } else {
      res.json( { error: "error missing inputs" } );
    }
}

/**
* creates todo item
**/
controller.post = function (req, res) {
    if (req.body.todo) {
      models.Todo.create({
        checked: false,
        description: req.body.todo,
        UserId: req.session.user
      })
      .then(todo => {
        res.json( { message: todo } );
      })
      .catch(error => {
        res.json( { error: "error entering in db", message: error } );
      });
    } else {
      res.json( { error: "error missing inputs" } );
    }
}

/**
* deletes todo item
**/
controller.delete = function (req, res) {
	if (req.body.id) {
      models.Todo.destroy({
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