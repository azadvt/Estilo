var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var vendorRouter = require('./routes/vendor')
const handlebars = require('koa-handlebars')
let hbs = require('express-handlebars')
var app = express();
let db = require('./config/connection');
let session = require('express-session');
const nocache = require("nocache");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const isEqualHelperHandlerbar = function(a, b, opts) {
  if (a == b) {
    console.log(a);
    console.log("=======handlebars");
      return opts.fn(this) 
  } else { 
      return opts.inverse(this) 
  } 
}

app.engine('hbs', hbs.engine({
  helpers:{
    if_equal : isEqualHelperHandlerbar,
  inc:function(value,options){
    return parseInt(value)+1;
    
  }
},extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout', userDir:__dirname + '/views/user',adminDir:__dirname + '/views/admin', partialsDir:__dirname + '/views/partials/'}));


app.use(nocache());

app.use(logger('dev'));
app.use(express.json());  
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:'key',resave:false,saveUninitialized:true,cookie:{maxAge:60000000}}))
db.connect((err)=>{
  if(err){
    console.log("connection error");
  }
  else{
    console.log("database conncected");
  }
})

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter)


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
