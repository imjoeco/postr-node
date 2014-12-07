var express = require('express');
var app = express();

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Routes
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));
app.use('/post_relations', require('./routes/post_relations'));


// Connect to mongo
var mongoose = require('mongoose'); 
mongoose.connect('mongodb://127.0.0.1:27017');

// Serve static content from /public
app.use(express.static(__dirname + '/public'));


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
      message: err.message,
      error: {}
  });
//  switch(err.status || 500){
//    case 404:
//      res.redirect('/404.html');
//    default:
//      res.redirect('/500.html');
//  }
});

module.exports = app;
