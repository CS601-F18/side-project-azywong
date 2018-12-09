var utils = require('../utils')
  , models = require('../models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync();

module.exports = {
    get: function (req, res) {
    	res.render('signup', { authenticated: false, error: req.query.error });
    },
    post: function (req, res) {
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
}