/* Copyright IBM Corp. 2013 All Rights Reserved                      */
/*eslint-env node */

var http = require('http');
var path = require('path');
var express = require('express');
var hogan = require('hogan-express');
var mysql = require('mysql');
var fs = require('fs');

var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

// all environments
var app = express();

// check if application is being run in cloud environment
if (process.env.VCAP_SERVICES) {
  var services = JSON.parse(process.env.VCAP_SERVICES);

  // look for a service starting with 'mysql'
  for (var svcName in services) {
    if (svcName.match(/^mysql/)) {
      var mysqlCreds = services[svcName][0]['credentials'];
      var db = mysql.createConnection({
        host: mysqlCreds.host,
        port: mysqlCreds.port,
        user: mysqlCreds.user,
        password: mysqlCreds.password,
        database: mysqlCreds.name
      });

      createTable();
    }
  }
}
else {
  var db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'bluemix',
    password: 'bluemix',
    database: 'bluemix-test'
  });

  createTable();
}

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('env', 'development');
app.engine('html', hogan);

app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// show table
app.all('/', function (req, res) {
  getPosts(function (err, posts) {
    if (err) return res.json(err);
    res.render('index.html', {posts: posts});
  });
});

// upload file
app.post('/upload', function (req, res) {
  fs.readFile(req.files.file.path, 'utf8', function (err, data) {
    if (err) return res.json(err);
    // split file into array of non-empty Strings
    var posts = data.split(/\r\n?|\n/).filter(isNotEmpty);

    // insert posts into mysql db
    addPosts(posts, function (err, result) {
      if (err) return res.json(err);
      var msg = 'Added ' + result.affectedRows + ' rows.';

      // display all posts
      getPosts(function (err, posts) {
        if (err) return res.json(err);
        res.render('index.html', {posts: posts, msg: msg});
      });
    });
  });
});

// clear table
app.get('/delete', function (req, res) {
  deletePosts(function (err, result) {
    if (err) return res.json(err);
    var msg = 'Deleted ' + result.affectedRows + ' rows.';
    res.render('index.html', {msg: msg});
  });
});

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening at http://' + host + ':' + port);
});

function createTable() {
  var sql = 'CREATE TABLE IF NOT EXISTS posts ('
            + 'id INTEGER PRIMARY KEY AUTO_INCREMENT,'
            + 'text text'
          + ');';
  db.query(sql, function (err, result) {
    if (err) console.log(err);
  });
}

function getPosts(cb) {
  var sql = 'SELECT text FROM posts';
  db.query(sql, function (err, result) {
    if (err) return cb(err);
    cb(null, result);
  });
}

function addPosts(posts, cb) {
  var sql = 'INSERT INTO posts (text) VALUES ?';

  var values = posts.map(function (post) {
    return [post];
  });

  db.query(sql, [values], function (err, result) {
    if (err) return cb(err);
    cb(null, result);
  });
}

function deletePosts(cb) {
  var sql = 'DELETE FROM posts WHERE 1';
  db.query(sql, function (err, result) {
    if (err) return cb(err);
    cb(null, result);
  });
}

function isNotEmpty(str) {
  return str && str.trim().length > 0;
}
