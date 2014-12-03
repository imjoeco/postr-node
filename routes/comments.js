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

module.exports = router;
