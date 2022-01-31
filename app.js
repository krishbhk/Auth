//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const encrypt = require('mongoose-encryption');
// const md5  =require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// const secretKey = process.env.SECRET_KEY;
// userSchema.plugin(encrypt, {secret: secretKey, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req,res)=>{
  res.render('home');
});

app.get('/login',(req,res)=>{
  res.render('login');
});
app.post('/login',(req,res)=>{
  const user = new User({
    username:req.body.username,
    password: req.body.password
  });
  req.login(user, err=>{
    if(err){
      console.log(err.message);
      res.redirect('/login');
    } else{
      res.redirect('/secrets');
    }
  });
});

app.get('/register',(req,res)=>{
  res.render('register');
});
app.post('/register',(req,res)=>{
  User.register({username: req.body.username}, req.body.password, (err,user)=>{
    if(err){
      console.log(err.message);
      res.redirect('/');
    } else{
      passport.authenticate("local")(req,res, ()=>{
        res.redirect('/secrets');
      })
    }
  });
});

app.get('/secrets', (req,res)=>{
  if(req.isAuthenticated()){
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("listening... to port: " + PORT);
});
