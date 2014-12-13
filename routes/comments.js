var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Comment = require('../models/comment');

//Comment.find({},function(err, comments){
//  comments.forEach(function(comment){comment.remove()});
//});

/* CREATE new comment. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.user = req.user;

  Comment.create(params, function(statusCode, responseBody){
    res.status(statusCode).json(responseBody);
  });
});

/* READ comment list by post id. */
router.get('/:post_id', function(req, res) {
  Comment.find({post_id:req.params.post_id}).sort("-created_at").exec(function(err,comments){
    res.json(comments);
  });
});

/* UPDATE comment */
router.put('/:comment_id', auth, function(req, res) {
  console.log(req.route);
  Comment.findOne({_id:req.params.comment_id}, function(err,comment){
    if(comment && comment.user_id == req.user._id){
      comment.content = req.body.content;
      comment.save(function(err, comment){
        if(comment) Comment.find({post_id:comment.post_id}).sort("-created_at").exec(function(err,comments){
          if(comments) res.json(comments);
        });
        else res.status(500).json();
      });
    }
    else if(comment) res.status(401).json();
    else res.status(404).json();
  });
});

/* UPDATE post vote */
router.get('/:comment_id/vote', auth, function(req, res) {
  Comment.findOne({_id: req.params.comment_id},function(err,comment){
    if(comment){
      comment.karmaBump(req.user._id,function(statusCode, responseBody){
        res.status(statusCode).json();
      });
    }
    else res.status(404).json({message:"Comment not found"});
  });
});

module.exports = router;
