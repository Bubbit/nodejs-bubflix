var express = require('express');
var uTorrent = require('./uTorrent/utorrent');
var UTorrent = require('machinepack-utorrent');
var request = require('request');
const zlib = require('zlib');
const querystring = require('querystring');

var fs = require('fs');
var app = express();

var imdbJson = JSON.parse(fs.readFileSync('assets/imdb.json', 'utf8'));

//Maybe replace with cors?
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');

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

var utorrent = new uTorrent('localhost', '62348');
utorrent.setCredentials('admin', 'pancake');

// MOCK FUNCTIONS
app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/imdb', function(req, res) {
  res.json(imdbJson);
});

app.get('/search/movies', function(req, res) {
  console.log("SEARCH CALL: ", req.query.s);
  request({'uri': 'http://www.omdbapi.com/?s=' + req.query.s + '&y=&type=movie&plot=short&r=json'},
    function (error, response, body) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      if(error) {
        console.log('Error on /imdb/search/movies', error);
        //Return 500
      } else {
        console.log(body);
        res.send(body);
      }
  });
});

app.get('/imdb/search/series', function(req, res) {
  request({'uri': 'http://www.omdbapi.com/?s=' + req.query.s + '&y=&type=serie&r=json'},
    function (error, response, body) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      if(error) {
        console.log('Error on /imdb/search/series/', error);
        //Return 500
      } else {
        res.send(body);
      }
  });
});

app.get('/yts', function(req, res) {
 console.log("download" + req.query.title.replace('?', ''));
  request({'uri': `https://yts.ag/api/v2/list_movies.json?query_term=${req.query.title}&sort=seeds&limit=15`}, 
    function (error, response, body) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      if(error) {
        console.log('Error on /kat/movies', error);
        //Return 500
      } else {
        res.send(body);
      }
  });
});

app.get('/kat/movies', function(req, res) {
  console.log("download" + req.query.title.replace('?', ''));
  request({'uri': 'https://kat.cr/json.php?q=' + req.query.title.replace('?', '') + '+category:movies'}, 
    function (error, response, body) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      if(error) {
        console.log('Error on /kat/movies', error);
        //Return 500
      } else {
        res.send(body);
      }
  });
});

app.get('/torrent/list', function(req, res) {
  utorrent.call('list', function(err, torrents_list) {
    if(err) { console.log(err); return; }

    console.log(torrents_list);
    res.json(torrents_list);
  });
});

var options = {};
    options.headers = {};
    options.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31';
    options.followAllRedirects = true;
    options.encoding = null;

app.get('/torrent/add', function(req, res) {
  options.uri = req.query.torrent;
  request(options, function (error, response, torrentFileBuffer) {
    zlib.unzip(torrentFileBuffer, (err, buffer) => {
      if (!err) {
        utorrent.call('add-file', {'torrent_file': buffer}, function(err, data) {
          if(err) { console.log('error : '); console.log(err); return; }

          console.log('Successfully added ' + req.query.torrent + 'torrent file !');
        });
      } else {
        console.log(err);
      }
    });
  });
});

app.get('/torrent/magnet', function(req, res) {
  utorrent.call('add-url', {'s': `magnet:?xt=urn:btih:C5D2C46F8F4DB1817A4A74B5235C9AE5A02A8B44&dn=Remco&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce`}, function(err, data) {
        if(err) { console.log('error : '); console.log(err); return; }

        console.log('Successfully added ' + JSON.stringify(data) + 'torrent file !');
  });
});
 
app.listen(3000);
console.log('======================');
console.log(' Started on port 3000');
console.log('======================');

