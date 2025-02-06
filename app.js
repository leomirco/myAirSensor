var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var readingsRouter = require('./routes/readings');
require('dotenv').config();
process.title = "myAirSensor";
const port = process.env.PORT || 3000; 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//---------------------------------------------------------
/*
 Imports the express library.
 This is necessary to have an express server.
*/
const bodyParser = require("body-parser"); // Node.js body parsing middleware.

//Telling the app what modules / packages to use
app.use(bodyParser.json());
// Express modules / packages

app.use(bodyParser.urlencoded({ extended: true }));

//---------------------------------------------------------

app.use('/', indexRouter);
app.use('/readings', readingsRouter);
//app.use('/models', modelsRouter);
app.use(express.static('client'));
// http://localhost:3000/css/base.css

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log('App listening at http://localhost:${port}')
});

module.exports = app;
