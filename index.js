var express = require('express');
var requestify = require('requestify');

var fs = require('fs');
var app = express();

var imdbJson = JSON.parse(fs.readFileSync('assets/imdb.json', 'utf8'));

//Maybe replace with cors?
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/imdb', function(req, res) {
  res.json(imdbJson);
});

app.get('/imdb/search', function(req, res) {
  requestify.get('http://www.omdbapi.com/?s=' + req.query.s + '&y=&type=movie&r=json')
  .then(function(response) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      res.json(response.getBody());
  });
});
 
app.listen(4000);