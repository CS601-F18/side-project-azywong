var express     = require('express')
  , http        = require('http')
  , mysql       = require('mysql')
  , port        = process.argv[2] || 8000

var connection = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var app = express()
app.use(express.static(__dirname + '/static'))

app.get('/', function (req, res) {

})

http.createServer(app).listen(port, function (err) {
  if (!err) console.log('Listening on port ' + port)
})