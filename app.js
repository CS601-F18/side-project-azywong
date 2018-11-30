var express      = require('express')
  , http         = require('http')
  , port         = process.env.PORT || 8000
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session      = require('express-session')
  , models = require('./models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync()
  , utils = require('./utils')
  , helper = require('sendgrid').mail
  , crypto = require('crypto')
  , async = require("async")
  , sgMail = require('@sendgrid/mail');

if (process.env.SENGRID_API_KEY == undefined) {
  console.log("not found")
  var config = require('./config')
  sgMail.setApiKey(config.development.sendgrid);
} else {
  console.log("found")
  sgMail.setApiKey(process.env.SENGRID_API_KEY);
}

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/static'));

/**
* Use this for all routes
* if the user isn't set or cookie is invalid, clear the cookie
* then pass handling to next
**/
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

// referenced for middleware https://www.codementor.io/mayowa.a/how-to-build-a-simple-session-based-authentication-system-with-nodejs-from-scratch-6vn67mcy3
/**
* Middleware function that checks for logged in user
* If the user is logged in and session is valid, it redirects to dashboard
**/
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};


/**
* Route for index
* sessionChecker automatically checks for a logged in user
* otherwise redirect to the login page
**/
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

/**
* Route for signup page
* sessionChecker automatically checks for a logged in user
*
* GET renders signup page
* POST attempts to create a user
**/
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render('signup', { authenticated: false, error: req.query.error });
    })
    .post((req, res) => {
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
    });

// route for login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login', { authenticated: false, error: req.query.error })
    })
    .post((req, res) => {
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
    });

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        var thisWeek = utils.getThisWeek();

        models.Todo.findAll({ where: { UserId: req.session.user } }).then(function (todos) {
          models.Event.findAll(
            { where:
              { UserId: req.session.user,
                startdate: {
                  [models.Sequelize.Op.gte]: thisWeek[0],
                  [models.Sequelize.Op.lte]: thisWeek[6].setHours(23,59,59)
                }
              }
          }).then(function(events) {
            var orderedEvents = utils.orderEvents(events, thisWeek);
            var orderedTodos = utils.orderTodos(todos);
            console.log(orderedEvents);
            res.render('dashboard', { authenticated: true, todos: orderedTodos, events: orderedEvents, error: req.query.error});
          })
        });
    } else {
        res.redirect('/login');
    }
});

// route for logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.route('/todo')
  .all((req, res, next) => {
    if (req.session.user && req.cookies.user_sid && req.body) {
      next();
    } else {
      var error = "not authenticated or missing req.body"
      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
    }
  })
  .post((req, res, next) => {
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
  })
  .put((req, res, next) => {
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
  })
  .delete((req, res, next) => {
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
  });

app.route('/event')
  .all((req, res, next) => {
    if (req.session.user && req.cookies.user_sid && req.body) {
      next();
    } else {
      var error = "not authenticated or missing req.body"
      res.redirect("/dashboard" + "?error=" + encodeURIComponent(error));
    }
  })
  .post((req, res, next) => {
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
  })
  .delete((req, res, next) => {
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
  });

app.route('/forgot_password')
  .get((req, res, next) => {
    res.render('forgot_password', { authenticated: false });
  })
  .post((req, res, next) => {
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
            var content = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n';

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
            })
          }).catch((err) => {
            console.log(err)
          })
        });
      }
    ], function(err) {
      if (err) res.redirect('/forgot_password');
    });
  });

app.route('/reset/:token')
  .get((req, res) => {
    models.User.findOne({ where: { resetPasswordToken: req.params.token, resetPasswordExpires: { [models.Sequelize.Op.gte]: Date.now() } }
    }).then((user) => {
      if(!user) {
        res.render('forgot_password', { authenticated: false, error: "Password reset token is invalid or has expired." });
      } else {
        res.render('reset_password', { authenticated: false, resetPasswordToken: req.params.token });
      }

    });
  })
  .post((req, res) => {
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
})



// route for handling 404 requests
app.use(function (req, res, next) {
  res.status(404).send("page not found")
});


models.sequelize.sync().then(function() {
  http.createServer(app).listen(port, (err) => {
    if (!err) console.log('Listening on port ' + port)
  })
})

var validPassword = function (password, saved) {
  return bcrypt.compareSync(password, saved);
}
