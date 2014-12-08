var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Post = require('../models/post');
var PostRelation = require('../models/post_relation');
//PostRelation.find({},function(err, prs){
//  prs.forEach(function(pr){pr.remove();});
//});

/* CREATE or READ relation by post title. */
router.get('/:post_id', auth, function(req, res) {
  Post.findOne({_id: req.params.post_id}, function(err, post){
    if(post){
      PostRelation.findOrCreate({
        username: req.user.username,
        user_id: req.user._id,
        post_id: post._id
      },function(statusCode,postRelation){
        res.status(statusCode).json(postRelation);
      });
    }
    else res.status(404).json({message:"Post not found"}); // post not found
  })

});

module.exports = router;
