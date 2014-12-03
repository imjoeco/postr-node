var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('./authentication/auth');

/* CREATE user document */
router.post('/', function(req, res) {
  var params = req.body;
  User.create(params, function(err, user){
    if(err){
      res.status(err.code).json([err.message]);
    }
    else{
      res.cookie('username',user.username);
      res.cookie('remember_token', user.remember_token);
      res.status(201).json(user);
    }
  });
});

// signin
router.post('/signin', function(req, res){
  var params = req.body;

  User.authenticate(params, function(err, user){
    if(err){
      res.status(err).json();
    }
    else{
      res.cookie('username',user.username);
      res.cookie('remember_token', user.remember_token);
      res.status(200).json();
      console.log(user.username + " logged in.");
    }
  });
});

/* READ user index */
router.get('/', auth, function(req, res) {
  User.find({},function(err,users){
    res.json(users[0]);
  });
});

/* READ user document */
router.get('/:username', function(req, res) {
  User.find({username:req.params.username},function(err,users){
    if(err) throw err;
    if(users.length > 0){
      res.json({
        name: users[0].username,
        created_at: users[0].created_at,
        about_me: users[0].about_me
      });
    }
  });
});

/* UPDATE user document */
router.put('/:username', auth, function(req, res) {
  if(req.params.username == req.cookies.username){
    User.update({username:req.params.username}, {about_me:req.body.about_me}, function(err,users){
      if(err) throw err;
      res.status(200).json();
    });
  }
});


module.exports = router;
