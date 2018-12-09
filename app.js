var express      = require('express')
  , http         = require('http')
  , port         = process.env.PORT || 8000
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session      = require('express-session')
  , models = require('./models/index.js')
  , dashboardCtrl = require('./controllers/dashboardController')
  , signupCtrl = require('./controllers/signupController')
  , loginCtrl = require('./controllers/loginController')
  , todoCtrl = require('./controllers/todoController')
  , eventCtrl = require('./controllers/eventController')
  , forgotPasswordCtrl = require('./controllers/forgotPasswordController')
  , resetTokenCtrl = require('./controllers/resetTokenController')


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.secret == undefined) {
  var config = require('./config')
  var secret = config.secret;
} else {
  var secret = process.env.secret;
}

app.use(session({
    key: 'user_sid',
    secret: secret,
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
      signupCtrl.get(req, res);
    })
    .post((req, res) => {
      signupCtrl.post(req, res);
    });

/**
* Route for login
* sessionChecker automatically checks for a logged in user
*
* GET renders login page
* POST attempts to authenticate user
**/
app.route('/login')
    .get(sessionChecker, (req, res) => {
      loginCtrl.get(req, res);
    })
    .post((req, res) => {
      loginCtrl.post(req, res);
    });

/**
* Route for dashboard page
*
* GET renders dashboard to a logged in user
**/
app.get('/dashboard', (req,res) => {
  dashboardCtrl.getDash(req, res)
});

/**
* Route for dashboard/:date page
*
* GET renders dashboard of that thisWeek to a logged in user
**/
app.get('/dashboard/:date', (req, res) => {
  dashboardCtrl.getDatedDash(req, res);
});

/**
* Route for logouter
*
* GET clears the session and redirects to login page
**/
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

/**
* Route for todo
*
* Before all routes, ALL makes sure the user is logged in
* POST attempts to create a todo for the user
* PUT attempts to update a todo for the user
* DELETE attempts to delete a todo for the user
**/
app.route('/todo')
  .all((req, res, next) => {
    todoCtrl.all(req, res, next)
  })
  .post((req, res) => {
    todoCtrl.post(req, res);
  })
  .put((req, res) => {
    todoCtrl.put(req, res)
  })
  .delete((req, res) => {
    todoCtrl.delete(req, res)
  });

/**
* Route for event page
*
* Before all routes, ALL checks for authenticated user
* POST attenpts to create an event for user
* DELETE attempts to delete the todo if it belongs to the user
**/
app.route('/event')
  .all((req, res, next) => {
    eventCtrl.all(req, res, next)
  })
  .post((req, res) => {
    eventCtrl.post(req, res)
  })
  .delete((req, res) => {
    eventCtrl.delete(req, res)
  });

/**
* Route for forgot password
*
* GET renders the forgot password page
* POST attempts to find a user with the parameters, then send a reset email
**/
app.route('/forgot_password')
  .get((req, res) => {
    forgotPasswordCtrl.get(req, res);
  })
  .post((req, res) => {
    forgotPasswordCtrl.post(req, res);
  });

/**
* Route for password reset page
*
* GET attempts to find a user with the token and if the token and user are valid, render the reset form
* POST posts to reset the password with the token and new password
**/
app.route('/reset/:token')
  .get((req, res) => {
    resetTokenCtrl.get(req, res);
  })
  .post((req, res) => {
    resetTokenCtrl.post(req, res);
  });



/**
* Route for handling 404 erros
**/
app.use(function (req, res, next) {
  res.status(404).send("page not found :(")
});


// sync db models, then create server
models.sequelize.sync().then(function() {
  http.createServer(app).listen(port, (err) => {
    if (!err) console.log('Listening on port ' + port)
  })
})
