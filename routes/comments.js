var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var User = require('../models/user');
var Comment = require('../models/comment');
var PostRelation = require('../models/post_relation');

//Comment.find({},function(err, comments){
//  comments.forEach(function(comment){comment.remove()});
//});

/* CREATE new comment. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.user = req.user;

  Comment.create(params, function(statusCode, comment){
    if(statusCode == 201){
      PostRelation.findOne({
        post_id: comment.post_id, 
        username: comment.username
      }, function(err, postRelation){
        postRelation.comment_count += 1;
        postRelation.save();
      });
    }
    res.status(statusCode).json(comment);
  });
});

/* READ comment index by post title. */
router.get('/:post_id', function(req, res) {
  Comment.find({post_id:req.params.post_id},function(err,comments){
    res.json(comments);
  });
});

/* UPDATE post vote */
router.get('/:comment_id/vote', auth, function(req, res) {
  Comment.findOne({_id: req.params.comment_id},function(err,comment){
    if(comment){
      PostRelation.findOne({
        username: req.user.username,
        post_id: comment.post_id
      }, function(err, postRelation){
        if(postRelation){
          var commentIndex = postRelation.voted_comments.indexOf(comment._id);
          ~commentIndex ? comment.karma-- : comment.karma++;
          comment.save(function(err, comment){
            if(comment){
              if(~commentIndex) postRelation.voted_comments.splice(commentIndex,1);
              else postRelation.voted_comments.push(comment._id);

              postRelation.save(function(err, postRelation){
                if(postRelation) res.status(200).json(); // success
                else res.status(500).json({message:"Internal server error : Post Relation"});
              });

              User.findOne({_id: comment.user_id}, function(err,user){
                // users can't bump their own karma
                if(user._id != req.user._id){
                  ~commentIndex ? user.karma-- : user.karma++;
                  user.save();
                }
              });
            }
            else res.status(500).json({message:"Internal server error : Comment"});
          });
        }
        else res.status(404).json({message:"Post relation not found"});
      });
    }
    else res.status(404).json({message:"Post not found"});
  });
});

module.exports = router;
