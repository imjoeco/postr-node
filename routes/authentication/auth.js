var User = require('../../models/user');

module.exports = function(req, res, next){
  User.findOne({username:req.cookies.username},function(err, user){
    if(user){
      if(user.remember_token == req.cookies.remember_token){
        req.user = user;
        next();
      }
      else{ //unauthorized
        res.status(401).json();
      }
    } 
    else{ //user not found
      res.status(404).json();
    }
  });
}
