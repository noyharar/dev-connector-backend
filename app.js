var createError = require('http-errors');
const http = require('http');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var authRouter = require('./routes/api/auth');
var usersRouter = require('./routes/api/users');
var postsRouter = require('./routes/api/posts');
var profileRouter = require('./routes/api/profile');

var cors = require("cors");
const connectDB = require('./config/db')

connectDB();

var app = express();

app.use(express.json());

app.use(cors());

//
//
app.use(logger('dev'));
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
