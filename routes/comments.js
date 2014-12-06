var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Comment = require('../models/comment');

/* CREATE new comment. */
router.post('/', auth, function(req, res) {
  var params = req.body;
  params.username = req.cookies.username;

  Comment.create(params, function(statusCode, comment){
    res.status(statusCode).json(comment);
  });
});

/* READ comment index by post title. */
router.get('/:post_title', function(req, res) {
  Comment.find({post_title:req.params.post_title},function(err,comments){
    res.json(comments);
  });
});

/* Vote on comment index by post title. */
router.get('/:comment_id/vote',auth, function(req, res) {
  //UserProfile = 
  Comment.findOne({_id:req.params.comment_id},function(err,comment){
    res.json(comments);
  });
});

module.exports = router;
