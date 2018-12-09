var models = require('../models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync()
  , sgMail = require('@sendgrid/mail');

// send grid API key configuration
if (process.env.SENGRID_API_KEY == undefined) {
  var config = require('../config')
  sgMail.setApiKey(config.development.sendgrid);
} else {
  sgMail.setApiKey(process.env.SENGRID_API_KEY);
}

module.exports = {
	get: function (req, res) {
		models.User.findOne({ where: { resetPasswordToken: req.params.token, resetPasswordExpires: { [models.Sequelize.Op.gte]: Date.now() } }
	    }).then((user) => {
	      if(!user) {
	        res.render('forgot_password', { authenticated: false, error: "Password reset token is invalid or has expired." });
	      } else {
	        res.render('reset_password', { authenticated: false, resetPasswordToken: req.params.token });
	      }

	    });
	},
	post: function (req, res) {
		models.User.update({
	        password: bcrypt.hashSync(req.body.password, salt),
	        resetPasswordToken: null,
	        resetPasswordExpires:  null
	      },
	      {
	        returning: true,
	        where: {
	          resetPasswordToken: req.params.token,
	          resetPasswordExpires: { [models.Sequelize.Op.gte]: Date.now() }
	        }
	      }).then(([ rowsUpdate, [user] ]) => {
	        if (!user) {
	          res.render('forgot_password', { authenticated: false, error: "Password reset token is invalid or has expired." });
	        }
	        var to_email = user.email
	        var from_email = "minitodocal+passwordreset@gmail.com";
	        var subject = "Your password has been changed";
	        var content = 'This is a confirmation that your password for minitodocal has been changed.';

	        var mail = {
	          to: to_email,
	          from: from_email,
	          subject: subject,
	          text: content
	        }
	        sgMail.send(mail).then((response) => {
	          console.log("response: " + response);
	          req.session.user = user.id;
	          res.redirect("/dashboard");
	        }).catch((err) => {
	          console.log(err)
	        })
	    }).catch((error) => {
	      console.log(error)
	      res.render('forgot_password', { authenticated: false, error: "Password reset token is invalid or has expired." });
	    });
	}
}