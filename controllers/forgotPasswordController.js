var models = require('../models/index.js')
  , crypto = require('crypto')
  , async = require("async")
  , sgMail = require('@sendgrid/mail')

// send grid API key configuration
if (process.env.SENGRID_API_KEY == undefined) {
  var config = require('../config')
  sgMail.setApiKey(config.development.sendgrid);
} else {
  sgMail.setApiKey(process.env.SENGRID_API_KEY);
}

module.exports = {
	get: function (req, res) {
		res.render('forgot_password', { authenticated: false });
	},
	post: function (req, res) {
		// roughly followed http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
	    async.waterfall([
	      function(done) {
	        crypto.randomBytes(20, function(err, buf) {
	          var token = buf.toString('hex');
	          done(err, token);
	        });
	      },
	      function(token, done) {
	        models.User.findOne(
	          { where: { email: req.body.email, username: req.body.username}
	        }).then((user) => {
	          if (!user) {
	            res.render('forgot_password', { authenticated: false, error: "no account found with those details" });
	          }

	          user.resetPasswordToken = token;
	          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

	          user.save().catch((error) => {
	            res.render('forgot_password', { authenticated: false, error: "internal issue with generating a password reset, please try again later" });
	          }).then((result) => {
	            var to_email = user.email;
	            var from_email = "minitodocal+passwordreset@gmail.com";
	            var subject = "mini todocal password reset";
	            var content = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link to complete the process:\n\n' + 'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n';

	            var mail = {
	              to: to_email,
	              from: from_email,
	              subject: subject,
	              text: content
	            }
	            sgMail.send(mail).then((response) => {
	              console.log("response: " + response);
	              res.render('forgot_password', { authenticated: false, error: "Successfully sent reset email" });
	            }).catch((err) => {
	              console.log(err)
	              res.render('forgot_password', { authenticated: false, error: "Something went wrong!  Unable to send a reset email" });
	            })
	          }).catch((err) => {
	            console.log(err)
	            res.render('forgot_password', { authenticated: false, error: "Something went wrong!  Unable to send a reset email" });
	          })
	        });
	      }
	    ], function(err) {
	      console.log(err);
	      res.render('forgot_password', { authenticated: false, error: "Something went wrong!  Unable to send a reset email" });
	    });
	}
}