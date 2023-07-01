var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bcrypt = require('bcrypt');

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

app.use(cors({
  origin: 'http://192.168.235.228192.168.0.14:5000', // replace with the origin of your client
  methods: ['GET', 'POST'], // the methods you want to allow
  credentials: true // allow session cookies from the client to be sent in CORS requests
}));

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});


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

let users = [];

// Hardcoded username and password for testing
const testUsername = 'testUser';
const testPasswordHash = bcrypt.hashSync('testPassword', 10);
users.push({username: testUsername, password: testPasswordHash});

console.log(users);

// User login
app.post('/login', function(req, res) {
  const { username, password } = req.body;

  console.log(username);
  console.log(password);

  // Check if the username exists in the users array
  const foundUser = users.find(user => user.username === username);

  console.log(foundUser);

  if (!foundUser) {
    // Username not found
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Check if the password is correct
  const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

  if (!isPasswordCorrect) {
    // Incorrect password
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // User is authenticated
  res.json({ message: 'User logged in successfully.' });
});

// User registration
app.post('/register', async (req, res) => {
  const { username, password, confirmPassword, email} = req.body;

  // Validate the user data...
  
  if (username.length < 6) {
    return res.status(400).json({ message: 'Username must be at least 6 characters long' });
  }

  if (password.length < 6 && password.includes(" ")) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long and should not include a space'});
  }

  // At least one number, one uppercase letter, one lowercase letter and one special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character' });
  }

  // Check that the password and confirmation match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken.' });
  }

  // Check if the email is valid
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const existingEmail = users.find(user=> user.email === email);
  if (existingEmail) {
    return res.status(400).json({ message: 'Email already taken.' });
  }

  // Store the user data (you'll want to replace this with code to store the user in your database)
  users.push({ username, password: hashedPassword, email });

  // Here you would insert the user into your database
  // For now, we'll just log the user object and send a success message
  console.log(users);
  res.json({ message: 'User registered successfully.' });
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
