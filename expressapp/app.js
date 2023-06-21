var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var formData = [];
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/forms', function(req, res) {
  res.json(formData);
});

app.post('/forms', function(req, res) {
  formData.push(req.body);
  res.status(201).json({ message: 'Form data submitted successfully.' });
});

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



// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
