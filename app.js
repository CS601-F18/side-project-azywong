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

var orderTodos = function (todos) {
  var orderedTodos = [];
  for (var i = 0; i < todos.length; i++) {
    orderedTodos.push(todos[i].dataValues);
  };
  return orderedTodos;
}

var orderEvents = function (events, thisWeek) {
  var newEvents = {
    monday: {
      startdate: new Date(thisWeek[0].setHours(0,0,0)),
      enddate: new Date(thisWeek[0].setHours(23,59,59)),
      events: []
    },
    tuesday: {
      startdate: new Date(thisWeek[1].setHours(0,0,0)),
      enddate: new Date(thisWeek[1].setHours(23,59,59)),
      events: []
    },
    wednesday: {
      startdate: new Date(thisWeek[2].setHours(0,0,0)),
      enddate: new Date(thisWeek[2].setHours(23,59,59)),
      events: []
    },
    thursday: {
      startdate: new Date(thisWeek[3].setHours(0,0,0)),
      enddate: new Date(thisWeek[3].setHours(23,59,59)),
      events: []
    },
    friday: {
      startdate: new Date(thisWeek[4].setHours(0,0,0)),
      enddate: new Date(thisWeek[4].setHours(23,59,59)),
      events: []
    },
    weekend: {
      startdate: new Date(thisWeek[5].setHours(0,0,0)),
      enddate: new Date(thisWeek[5].setHours(23,59,59)),
      events: []
    }
  }

  for (var i = 0; i < events.length; i++) {
    var event = events[i].dataValues;
    Object.keys(newEvents).forEach(function (key) {
      if (event.startdate >= newEvents[key].startdate && event.enddate <= newEvents[key].enddate) {
        newEvents[key].events.push(event);
      }
    })
  };
  return newEvents;
}


var getThisWeek = function () {
  var range = []
  var d = new Date();
  var day = d.getDay();
  //https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
  var diff = d.getDate() - day + (day == 0 ? -6:1);

  for (var i = 0; i < 7; i++) {
    d = new Date();
    d.setHours(0,0,0);
    range.push(new Date(d.setDate(diff + i)))
  }
  return range;
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
                req.session.user = user.id;
                res.redirect('/dashboard');
            }
        });
    });

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        var thisWeek = getThisWeek();

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
            var orderedEvents = orderEvents(events, thisWeek);
            var orderedTodos = orderTodos(todos);
            console.log(orderedTodos);
            console.log(orderedEvents);
            res.render('dashboard', { authenticated: true, todos: orderedTodos, events: orderedEvents});
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

app.post('/todo', (req, res) => {
  if (req.session.user && req.cookies.user_sid && req.body) {
    models.Todo.create({
      checked: false,
      description: req.body.todo,
      UserId: req.session.user
    })
    .then(todo => {
      res.json( { status: "success", message: todo } );
    })
    .catch(error => {
      res.json( { status: "error", message: error } );
    });
  } else {
    res.json( { status: "error" } );
  }
});

app.put('/todo', (req, res) => {
  if (req.session.user && req.cookies.user_sid && req.body) {
    models.Todo.update({
      checked: req.body.checked
    },{
      where: {
        id: req.body.id,
        UserId: req.session.user
      }
    })
    .then(message => {
      res.json( { status: "success", message: message } );
    })
    .catch(error => {
      res.json( { status: "error", message: error } );
    });
  } else {
    res.json( { status: "error" } );
  }
});

app.delete('/todo', (req, res) => {
  if (req.session.user && req.cookies.user_sid && req.body) {
    models.Todo.destroy({
      where: {
        id: req.body.id,
        UserId: req.session.user
      }
    })
    .then(message => {
      res.json( { status: "success", message: message } );
    })
    .catch(error => {
      res.json( { status: "error", message: error } );
    });
  } else {
    res.json( { status: "error" } );
  }
});

app.post('/event', (req, res) => {

});

app.delete('/event', (req, res) => {

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

