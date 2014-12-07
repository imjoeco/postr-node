var express = require('express');
var router = express.Router();
var UserList = require('../models/user_list');
//var auth = require('./authentication/auth');

router.get('/:username/recent_list', function(req, res){
  var params = {
    username:req.params.username,
    list_type:'recent'
  };

  UserList.findOrCreate(params, function(list){
    console.log(list);
  });
});
