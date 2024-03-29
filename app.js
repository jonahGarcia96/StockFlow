const createError = require('http-errors');
const path = require('path')
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
// const store = require('connect-pg-simple');
const SequelizeStore = require('connect-session-sequelize')(session.Store);


const { sequelize } = require('./db/models');
const {sessionSecret} = require('./config')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const db = require('./db/models');
// const { v4: uuidv4} = require('uuid');//used to generate a key for session secret
const { restoreUser } = require('./auth');


const app = express();

// view engine setup

app.set('view engine', 'pug');
app.use(cookieParser(sessionSecret));
// console.log(uuidv4())//used to genearate a key for seesion secret
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: 'stock_flow.sid', //multiple apps running on server. preent multiple uses
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}))
app.use(restoreUser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/', indexRouter)

// set up session middleware
const store = new SequelizeStore({ db: sequelize });

app.use(
  session({
    // store: new (store(session))(),
    seceret: 'superSecret',
    store,
    saveUninitialized: false,
    resave: false,
  })
);

// create Session table if it doesn't already exist
store.sync();

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
