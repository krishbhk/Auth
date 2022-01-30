//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5  =require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
  email: String,
  password: String
});

// const secretKey = process.env.SECRET_KEY;
// userSchema.plugin(encrypt, {secret: secretKey, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

// module.exports = ;

app.get('/',(req,res)=>{
  res.render('home');
});

app.get('/login',(req,res)=>{
  res.render('login');
});
app.post('/login',(req,res)=>{
  User.findOne({
    email: req.body.username
  }, (err, foundUser)=>{
    if (err) {
      console.log(err.message);
    } else {
      if (!foundUser) {
        res.send('Incorrect e-mail or password');
      } else {
        bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
          // result == true
          if(result){
            res.render('secrets');
          }else{
            res.send('Incorrect e-mail or password');
          }
        });
      }

    }
  })
});

app.get('/register',(req,res)=>{
  res.render('register');
});
app.post('/register',(req,res)=>{
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      const user = new User({
        email: req.body.username,
        password: hash
      });

      user.save(err=>{
        if(err){
          console.log(err.message);
        }
      });
  });
  res.render('secrets');

});

app.get('/logout', (req, res)=>{
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("listening... to port: " + PORT);
});
