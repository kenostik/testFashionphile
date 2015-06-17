//definititions and requires

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bson = require('bson');
var cookieParser = require('cookie-parser'); 
var app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname+"/public"));
app.use(cookieParser());
app.use(session({
    secret: 'wolverinePack', 
    resave: false,
    saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

//Controllers 
var QueueCtrl = require('./controllers/QueueCtrl');
var UserCtrl = require('./controllers/UserCtrl');
var LocationCtrl = require('./controllers/LocationCtrl');

//Models
var User = require('./models/User');
var Location = require('./models/Location');
var Customer = require('./models/Customer');

//database
var mongoUri = "mongodb://localhost:27017/fashionphile";

//initializing mongoose

mongoose.connect(mongoUri);
mongoose.connection.once('open', function() {
    console.log("Connected to db at " + mongoUri);
});

//port
var port = 8080; 
app.listen(process.env.EXPRESS_PORT || port, function(){
    console.log("The Wolverine Pack is hunting on port ", port); 
});

//bodyParser

app.use(bodyParser.json());
// app.use(cookieParser());

//static 

app.use(express.static(__dirname+'/public'));

//add session secret
app.use(session({
    secret: 'aladhflkjadhlkjafd'
}))

//local login

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(username, password, done) {
    User.findOne({ email: username }).exec().then(function(user) {
        if (!user) {
            return done(null, false);
            console.log('no user');
        }
        user.comparePassword(password).then(function(isMatch) {
            if (!isMatch) {
                console.log('no match');
                return done(null, false);
            }
            return done(null, user);
        });
    });
}));

//add passport initialize and session middleware

app.use(passport.initialize());
app.use(passport.session());

//authorization check

var requireAuth = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(403).end();
    }
    return next();
}

//deserializer

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


//Sign Up && Add User 
app.post('/api/users/', UserCtrl.createUser);

//post local user

app.post('/api/users/auth', passport.authenticate('local'), function(req, res) {
    //if auth was successful, this will happen
    return res.status(200).end();
});


/* Endpoints 
**********************************************************************/
app.get('/selection', passport.authenticate('local'), requireAuth, function(req, res) {
    res.redirect(request.session.returnTo || '/selection');
});

app.get('/api/location', requireAuth, LocationCtrl.list);
app.get('/api/location/:id', requireAuth, LocationCtrl.listOne);
app.post('/api/location', requireAuth, LocationCtrl.create);
app.delete('/api/location/:id', requireAuth, LocationCtrl.delete);
app.put('/api/location/:id', requireAuth, LocationCtrl.update);

















