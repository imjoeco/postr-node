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

/* READ comment list by post id. */
router.get('/:post_id', function(req, res) {
  Comment.find({post_id:req.params.post_id},function(err,comments){
    res.json(comments);
  });
});

/* UPDATE post vote */
router.get('/:comment_id/vote', auth, function(req, res) {
  Comment.findOne({_id: req.params.comment_id},function(err,comment){
    if(comment){
      comment.karmaBump(req.user,function(statusCode, responseBody){
        res.status(statusCode).json();
      });
    }
    else res.status(404).json({message:"Comment not found"});
  });
});

module.exports = router;
