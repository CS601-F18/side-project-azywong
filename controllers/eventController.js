var models = require('../models/index.js')

module.exports = {
	all: function (req, res, next) {
		if (req.session.user && req.cookies.user_sid && req.body) {
	      next();
	    } else {
	      var error = "not authenticated or missing req.body"
	      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
	    }
	},
	post: function (req, res) {
		if (req.body.startdate && req.body.enddate && req.body.title) {
	      if( req.body.startdate <= req.body.enddate) {
	        models.Event.create({
	          startdate: req.body.startdate,
	          enddate: req.body.enddate,
	          title: req.body.title,
	          UserId: req.session.user
	        })
	        .then(message => {
	          res.redirect("/dashboard");
	        })
	        .catch(error => {
	          res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
	        });
	      } else {
	        var error = "startdate must be after end date!"
	        res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
	      }
	    } else {
	      var error = "invalid parameters"
	      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
	    }
	},
	delete: function (req, res) {
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
}