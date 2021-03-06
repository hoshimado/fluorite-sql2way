var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var api_v1_activitylog = require('./routes/api_v1');   // ★追加 for RESTful API★
var api_v1_serial = require('./routes/api_v1_serial'); // ★追加 for RESTful API★

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1/activitylog', api_v1_activitylog ); // ★追加 for RESTful API★
app.use('/api/v1/serial',      api_v1_serial );      // ★追加 for RESTful API★

module.exports = app;
