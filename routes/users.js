var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('./authentication/auth');

//User.find({}, function(err, users){
//  users.forEach(function(user){user.remove();});
//});

/* CREATE user document */
router.post('/', function(req, res) {
  var params = req.body;
  User.create(params, function(err, user){
    if(err){
      res.status(err.code).json({errors:[err.message]});
    }
    else{
      res.status(201).json(user.email_safe());
    }
  });
});

// Signin
router.post('/signin', function(req, res){
  var params = req.body;

  User.authenticate(params, function(err, user){
    if(err){
      if(user) res.status(err).json(user);
      else res.status(err).json();
    }
    else{
      res.cookie('username',user.username);
      res.cookie('remember_token', user.remember_token);
      res.status(200).json();
    }
  });
});


/* READ user document */
router.get('/:username', function(req, res) {
  User.findOne({username:req.params.username},function(err,user){
    if(err) res.status(err.status || 500).json();
    if(user){
      res.json({
        name: user.username,
        created_at: user.created_at,
        about_me: user.about_me,
        karma: user.karma
      });
    }
  });
});

/* UPDATE confirm user */
router.get('/:username/confirm/:confirmation_code', function(req, res) {
  User.findOne({username:req.params.username},function(err,user){
    if(err) res.status(err.status || 500).json();
    if(user){
      if(user.confirmation_code == req.params.confirmation_code){
        user.confirmation_code = undefined;
        user.email_attempts = 0;
        user.save();

        res.cookie('username',user.username);
        res.cookie('remember_token', user.remember_token);
        res.redirect('/');
      }
      else{
        console.log("nope");
      }
    }
  });
});

/* UPDATE confirm user */
router.get('/:username/resend_confirmation', function(req, res) {
  User.findOne({username:req.params.username},function(err,user){
    if(user){
      user.sendConfirmation(function(statusCode){
        res.status(statusCode).json();
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

module.exports = router;
