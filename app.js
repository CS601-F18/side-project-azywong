var config       = require('./config')
  , express      = require('express')
  , http         = require('http')
  , port         = process.argv[2] || 8000
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session      = require('express-session')
  , models = require('./models/index.js')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync();

var validPassword = function (password, saved) {
  return bcrypt.compareSync(password, saved);
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

//clear cookie if user isn't set in session
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

// https://www.codementor.io/mayowa.a/how-to-build-a-simple-session-based-authentication-system-with-nodejs-from-scratch-6vn67mcy3
// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};


// route for index
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render('signup', { authenticated: false });
    })
    .post((req, res) => {

        models.User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, salt)
        })
        .then(user => {
            console.log("reached post create user");
            console.log(user.dataValues);
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });

// route for login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login', { authenticated: false })
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        models.User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!validPassword(password, user.password)) {
                res.redirect('/login');
            } else {
              console.log(user.dataValues);
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('dashboard', { authenticated: true });
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


// route for handling 404 requests
app.use(function (req, res, next) {
  res.status(404).send("page not found")
});


models.sequelize.sync().then(function() {
  http.createServer(app).listen(port, (err) => {
    if (!err) console.log('Listening on port ' + port)
  })
})

