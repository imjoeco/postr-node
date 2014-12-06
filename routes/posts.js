var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Post = require('../models/post');

//Post.find({},function(err,posts){
//  posts.forEach(function(post){post.remove();});
//});

/* CREATE new post. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.username = req.cookies.username;

  Post.create(params, function(statusCode){
    res.status(statusCode).json();
  });
});

/* READ post index. */
router.get('/', function(req, res) {
  Post.find({},function(err,posts){
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

module.exports = router;
