var config       = require('./config')
  , express      = require('express')
  , http         = require('http')
  , port         = process.argv[2] || 8000
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session      = require('express-session')
  , models = require('./models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync()
  , utils = require('./utils');

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
            password: bcrypt.hashSync(req.body.password, salt)
        })
        .then(user => {
            req.session.user = user.dataValues;
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
      res.json( { error: "not authenticated or missing req.body" } );
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
      res.json( { error: "not authenticated or missing req.body" } );
    }
  })
  .post((req, res, next) => {
    if (req.body.startdate && req.body.enddate && req.body.title) {
      console.log(req.body)
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
