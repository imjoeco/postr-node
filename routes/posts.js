var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
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
  var titleRegex = new RegExp(req.params.title.replace(/\-/g,'.'),'i');
  Post.findOne({title: titleRegex},function(err,post){
    if(post) res.json(post);
    else res.status(404).json();
  });
});

/* UPDATE post vote by title */
router.put('/:title', auth, function(req, res) {
  var titleRegex = new RegExp(req.params.title.replace(/\-/g,'.'),'i');
  Post.findOne({
      title: titleRegex, 
      username: req.user.username
    },function(err,post){
      if(post){
        if(post.username == req.user.username){
          post.update({
            title:req.body.title, 
            content:req.body.content
          }, function(err, post){
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

/* UPDATE post vote by title */
router.get('/:title/vote', auth, function(req, res) {
  var titleRegex = new RegExp(req.params.title.replace(/\-/g,'.'),'i');
  Post.findOne({title: titleRegex},function(err,post){
    if(post){
      PostRelation.findOne({
        username: req.user.username,
        post_id: post._id
      }, function(err, postRelation){
        if(postRelation){
          post.update({
            karma: postRelation.voted ? post.karma - 1 : post.karma + 1
          },function(err, post){
            if(post){
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

      //res.status(201).json();
//      UserList.findOne({username: req.cookies.username, list_type: 'posts'},function(err,list){
//        list.addPost(post, console.log);
//      });

    }
    else res.status(404).json({message:"Post not found"});
  });
});

module.exports = router;
