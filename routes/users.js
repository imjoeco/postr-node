var express = require('express');
var router = express.Router();
var User = require('../models/user');
var UserList = require('../models/user_list');
var auth = require('./authentication/auth');

//User.find({}, function(err, users){
//  users.forEach(function(user){user.remove();});
//});

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

// Signin
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


/* READ user document */
router.get('/:username', function(req, res) {
  User.find({username:req.params.username},function(err,users){
    if(err) res.status(err.status || 500).json();
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
      if(err) res.status(err.status || 500).json();
      res.status(200).json();
    });
  }
});

/* READ user lists document */
router.get('/:username/:list_type', function(req, res) {
  switch(req.params.list_type){
    case "recent":
      require('../models/post')
        .find({username:req.params.username})
        .sort("-created_at")
        .limit(30)
        .exec(function(err, posts){
          if(posts) res.json(posts);
        });
      break;
    case "posts":
      require('../models/post')
        .find({username:req.params.username})
        .sort("-karma")
        .limit(30)
        .exec(function(err, posts){
          if(posts) res.json(posts);
        });
      break;
    case "comments":
      require('../models/comment')
        .find({username:req.params.username})
        .sort("-karma")
        .limit(30)
        .exec(function(err, comments){
          if(comments) res.json(comments);
        });
      break;
  }
});

router.post('/:username/:list_type', function(req, res) {
  UserList.addOrUpdate(req.params, function(list){
    res.json(list);
  });
});

module.exports = router;
