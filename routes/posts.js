var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Post = require('../models/post');
var FavoriteList = require('../models/favorite_list');

//Post.find({},function(err,posts){
//  posts.forEach(function(post){post.remove();});
//});

/* CREATE new post. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.username = req.user.username;
  params.user_id = req.user._id;

  Post.create(params, function(statusCode){
    res.status(statusCode).json();
    if(statusCode == 201){
    }
  });
});

/* READ post index. */
router.get('/', function(req, res) {
  // return 50 latest posts
  Post.find().sort("-created_at").limit(50).exec(function(err,posts){
    res.json(posts);
  });
});

/* READ top posts list. */
router.get('/top', function(req, res) {
  Post.find().sort("-karma").limit(50).exec(function(err,posts){
    if(posts) res.json(posts);
    else res.status(404).json();
  });
});

/* READ favorite posts list. */
router.get('/favorites', auth, function(req, res) {
  FavoriteList.findOne({username:req.user.username}, function(err, list){
    if(list) res.json(list);
  });
});

/* READ post by id */
router.get('/:post_id', function(req, res) {
  Post.findOne({_id: req.params.post_id},function(err,post){
    if(post) res.json(post);
    else res.status(404).json();
  });
});

/* UPDATE post */
router.put('/:post_id', auth, function(req, res) {
  Post.findOne({
      _id: req.params.post_id
    },function(err,post){
      if(post){
        if(post.user_id == req.user._id){
          post.title = req.body.title; 
          post.content = req.body.content;

          post.save(function(err, post){
            if(post) res.status(200).json(); // success
            else res.status(500).json(); // potential server error
          });
        }
        else res.status(401).json(); // edit not authorized
      }
      else res.status(404).json(); // post not found
    }
  );
});

/* UPDATE post vote */
router.get('/:post_id/vote', auth, function(req, res) {
  Post.findOne({_id: req.params.post_id},function(err,post){
    if(post){
      var params = req.params;
      params.user = req.user;

      post.karmaBump(params, function(statusCode, responseBody){
        res.status(statusCode).json(responseBody);
      });
    }
    else res.status(404).json({message:"Post not found"});
  });
});

/* UPDATE favorite post */
router.get('/:post_id/favorite', auth, function(req, res) {
  Post.findOne({_id: req.params.post_id},function(err,post){
    if(post){
      post.favorite(req.user._id, function(statusCode, responseBody){
        res.status(statusCode).json(responseBody);
      });
    }
    else res.status(404).json({message:"Post not found"});
  });
});

module.exports = router;
