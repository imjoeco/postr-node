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
