var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cors = require('cors');
require('./routes/passport')(passport);
var bcrypt= require('bcrypt');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoSessionURL = "mongodb://localhost:27017/sessions";
var expressSessions = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSessions);
var mysql      = require('mysql');
var app = express();

var admin = require('./routes/admin/admin');
var cars = require('./routes/cars/cars');
var flights = require('./routes/flights/flights');
var hotels = require('./routes/hotels/hotels');
var signup = require('./routes/signup/signuphandler');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'kayak'
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
     optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSessions({
    secret: "CMPE273_passport",
    resave: false,
    //Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, //force to save uninitialized session to db.
    //A session is uninitialized when it is new but not modified.
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 6 * 1000,
    store: new mongoStore({
        url: mongoSessionURL
    })
}));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);
app.use('/',admin);
app.use('/',flights);
app.use('/',cars);
app.use('/',hotels);
app.use('/',admin);
app.use('/',signup);

module.exports = app;
app.post('/logout', function(req,res) {
  console.log(req.session.user);
  req.session.destroy();

  console.log('Session Destroyed');
  res.status(201).send();
});

/*
app.post('/login', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if(err) {
      return next(err);
    }

    if(!user) {
      res.status(401).send();
    }

    req.logIn(user, {session:false}, function(err) {
      if(err) {
        return next(err);
      }
      console.log(user);
      req.session.user = user.username;
      console.log(req.session.user);
      console.log("session initilized")
      return res.status(201).send();
    })
  })(req, res, next);
});
*/


app.post('/loginUser', function(req, res,next) {
  const saltRounds = 10;
  var salt=bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(req.body.password, salt);
  console.log(hash);
  pool.getConnection(function(err, connection) {
    connection.query("select password from users where emailId='"+req.body.username+"'", function (error, results, fields) {
      connection.release();
      if (results.length>=1){
        bcrypt.compare(req.body.password,results[0].password, function(err, res1) {
          if(res1==true){
      //    res.status(201).send({status:201,msg:"Password is right"});



          passport.authenticate('login', function(err, user, info) {
            if(err) {
              return next(err);
            }

            if(!user) {
              res.status(401).send();
            }

            req.logIn(user, {session:false}, function(err) {
              if(err) {
                return next(err);
              }
              console.log(user);
              req.session.user = user.username;
              console.log(req.session.user);
              console.log("session initilized")
             return res.status(201).send({status:201,msg:"Password is right"});
             var t=time.localtime(Date.now()/1000);
             var date=""+t.month+"/"+t.dayOfMonth+"/2017";
             var curTime=""+t.hours+":"+t.minutes;

             fs.appendFile("./public/logging/"+req.session.user+".txt", "User logged in on "+date+" at "+curTime+",login\n", function(err) {
               if(err) {
                   res.send({0:0});

               }
               console.log("The file was saved!");
             });
            })
          })(req, res, next);








          }
          else{
            res.status(400).send({status:400,msg:"Password is wrong"})
          }
        });


      }
      else{
      res.status(404).send({msg:"Failed"});
    }

    });
  });
});
