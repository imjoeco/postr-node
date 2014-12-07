var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Post = require('../models/post');
var UserList = require('../models/user_list');

//Post.find({},function(err,posts){
//  posts.forEach(function(post){post.remove();});
//});

/* CREATE new post. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.username = req.user.username;

  Post.create(params, function(statusCode){
    res.status(statusCode).json();
    if(statusCode == 201){
      //UserList.
    }
  });
});

/* READ post index. */
router.get('/', function(req, res) {
  Post.find().sort("-created_at").limit(50).exec(function(err,posts){
    res.json(posts);
  });
});

/* READ post by title */
router.get('/:title', function(req, res) {
  var titleRegex = new RegExp(req.params.title.replace(/\-/,'.'),'i');
  Post.findOne({title: titleRegex},function(err,post){
    if(post) res.json(post);
    else res.status(404).json();
  });
});

/* UPDATE post vote by title */
router.get('/:title/vote', function(req, res) {
  var titleRegex = new RegExp(req.params.title.replace(/\-/,'\.'),'i');
  Post.findOne({title: titleRegex},function(err,post){
    if(post){
      res.status(201).json();
      UserList.findOne({username: req.cookies.username, list_type: 'posts'},function(err,list){
        list.addPost(post, console.log);
      });

    }
    else res.status(404).json();
  });
});

module.exports = router;
