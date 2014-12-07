var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var Post = require('../models/post');
var PostRelation = require('../models/post_relation');
//PostRelation.find({},function(err, prs){
//  prs.forEach(function(pr){pr.remove();});
//});

/* CREATE or READ relation by post title. */
router.get('/:post_title', auth, function(req, res) {
  var titleRegex = new RegExp(req.params.post_title.replace(/\-/g,'.'),'i');
  Post.findOne({title: titleRegex}, function(err, post){
    if(post){
      var params = {
        username: req.user.username,
        post_id: post._id
      }

      PostRelation.findOrCreate(params,function(statusCode,postRelation){
        res.status(statusCode).json(postRelation);
      });
    }
    else res.status(404).json({message:"Post not found"}); // post not found
  })

});

module.exports = router;
