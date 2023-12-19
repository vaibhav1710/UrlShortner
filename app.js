var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const expressSession = require("express-session");
const flash = require("connect-flash");
const MongoStore = require('connect-mongo');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// const store = new MongoStore({
//   url: "mongodb+srv://trufflevaibhav:XpGBR2Y3YJqYEY95@cluster0.utedcw9.mongodb.net/?retryWrites=true&w=majority",
//   secret:'thisismysecret',
//   touchAfter:24*60*60
// });
// store.on("error",function(e){
//   console.log("Session Error",e);
// });

const store = MongoStore.create({ mongoUrl:"mongodb+srv://trufflevaibhav:XpGBR2Y3YJqYEY95@cluster0.utedcw9.mongodb.net/?retryWrites=true&w=majority"})

app.use(expressSession({
  store,
  resave:false,
  saveUninitialized:false,
  secret: "hello hello bhaye bhaye"
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
