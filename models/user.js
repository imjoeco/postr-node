var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, index: true},
  password_digest: String,
  remember_token: String,
  karma:Number,
  about_me:String,
  created_at: Date
});

userSchema.statics.create = function(params, callback){
  var User = this;
  User.findOne({username:params.name},function(err, user){
    if(user){ // User with identical username exists
      callback({code:409, message: "Username already taken."}, null);
    }
    else{ // No user found: Create new user
      if(params.password == params.password_confirmation){
        bcrypt.hash(params.password, 10, function(err, hash){
          var userHash = {
            password_digest: hash,
            remember_token: crypto.createHash('sha256').digest('base64'),
            username: params.name,
            karma:0,
            created_at: Date.now()
          };

          new User(userHash).save(function(err, user){
            if(err) throw err;
            user._v = null;
            user._id = null;
            user.password_digest = "[FILTERED]";

            callback(null, user);
          });
        });
      }
      else{ // password and confirm don't match
        callback({code:400, message: "Password and confirmation do not match"}, null);
      }
    }
  });
};

// Check Password for Signin
userSchema.statics.authenticate = function(params, callback){
  this.findOne({username: new RegExp(params.name,"i")}, function(err, user){
    if(user){
      bcrypt.compare(params.password, user.password_digest, function(err, correctPassword){
        if(correctPassword) callback(null, user);
        else callback(401, null);
      });
    }
    else callback(404, null);// user not found 
  });
};

module.exports = mongoose.model('user', userSchema);
