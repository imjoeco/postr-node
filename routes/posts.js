var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var User = require('../models/user');
var Post = require('../models/post');
var PostRelation = require('../models/post_relation');
var UserList = require('../models/user_list');

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
router.get('/:post_id', function(req, res) {
  //var titleRegex = new RegExp(req.params.title.replace(/\-/g,'.'),'i');
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
      PostRelation.findOne({
        username: req.user.username,
        post_id: post._id
      }, function(err, postRelation){
        if(postRelation){
          post.karma = postRelation.voted ? post.karma - 1 : post.karma + 1;
          post.save(function(err, post){
            if(post){
              User.findOne({_id:post.user_id},function(err, user){
                // users can't bump their own karma
                if(user._id != req.user._id){
                  postRelation.voted ? user.karma-- : user.karma++;
                  user.save();
                }
              });
              postRelation.update({
                voted: postRelation.voted ? false : true
              }, function(err, postRelation){
                if(postRelation) res.status(200).json(); // success
                else res.status(500).json({message:"Internal server error : Post Relation"});
              });
            }
            else res.status(500).json({message:"Internal server error : Post"});
          });
        }
        else res.status(404).json({message:"Post relation not found"});
      });
    }
    else res.status(404).json({message:"Post not found"});
  });
});

module.exports = router;
