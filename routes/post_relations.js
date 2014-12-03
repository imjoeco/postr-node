var express = require('express');
var router = express.Router();
var auth = require('./authentication/auth');
var PostRelation = require('../models/post_relation');
//PostRelation.find({},function(err, prs){
//  prs.forEach(function(pr){pr.remove();});
//});

/* CREATE or READ relation by post title. */
router.get('/:post_title', auth, function(req, res) {
  var params = {
    username: req.cookies.username,
    post_title: req.params.post_title
  }

  PostRelation.findOrCreate(params,function(statusCode,postRelation){
    res.status(statusCode).json(postRelation);
  });
});

module.exports = router;
