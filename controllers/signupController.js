var utils = require('../utils')
  , models = require('../models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync();

/**
* controller that handlers the routes for signup
**/

var controller = {};

/**
* renders signup page
**/
controller.get = function (req, res) {
	res.render('signup', { authenticated: false, error: req.query.error });
}

/**
* attempts to create user then login them in and redirect to their dashboard
* otherwise redirects them to signup with error message
**/
controller.post =  function (req, res) {
    models.User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt)
    })
    .then(user => {
        req.session.user = user.id;
        res.redirect("/dashboard");
    })
    .catch(error => {
        res.redirect("/signup?error=" + encodeURIComponent("unable to signup"));
    });
}

module.exports = controller;