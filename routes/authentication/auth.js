var User = require('../../models/user');

module.exports = function(req, res, next){

  User.find({username:req.cookies.username},function(err, users){
    if(users.length > 0){
      if(users[0].remember_token == req.cookies.remember_token){
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
