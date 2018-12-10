var utils = require('../utils')
  , models = require('../models/index.js')
  , bcrypt = require('bcrypt');

// private method that validates a password against database entry
var validPassword = function (password, saved) {
  return bcrypt.compareSync(password, saved);
}

/**
* controller that handlers the routes for login
**/

var controller = {};

/**
* renders login page
**/
controller.get = function (req, res) {
	res.render('login', { authenticated: false, error: req.query.error });
}

/**
* attempts to authenticate a user and forward them to their dashboard
* otherwise redirects to login page with error
**/
controller.post = function (req, res) {
	var username = req.body.username,
        password = req.body.password;

    models.User.findOne({ where: { username: username } }).then(function (user) {
        if (!user) {
            res.redirect('/login?error=' + encodeURIComponent("user not found"));
        } else if (!validPassword(password, user.password)) {
            res.redirect('/login?error=' + encodeURIComponent("invalid credentials"));
        } else {
            req.session.user = user.id;
            res.redirect('/dashboard');
        }
    });
}

module.exports = controller;