//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
  email: String,
  password: String
});

const secretKey = 'Thisisasecret';
userSchema.plugin(encrypt, {secret: secretKey, encryptedFields: ['password']});

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
      }
      if(foundUser.password === req.body.password){
          res.render('secrets');
      } else {
        res.send('Incorrect e-mail or password');
      }
    }
  })
});

app.get('/register',(req,res)=>{
  res.render('register');
});
app.post('/register',(req,res)=>{
  const user = new User({
    email: req.body.username,
    password: req.body.password
  });

  user.save(err=>{
    if(err){
      console.log(err.message);
    } else{
      res.render('secrets');
    }
  });
});

app.get('/logout', (req, res)=>{
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("listening... to port: " + PORT);
});
