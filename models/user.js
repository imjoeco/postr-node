var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var salt = "SaltGoesHere"

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
        crypto.pbkdf2(
          params.password, 
          salt, 500, 128, 
          function(err, derivedKey) {
            var userHash = {
              password_digest: derivedKey,
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
          }
        );
      }
      else{ // password and confirm don't match
        callback({code:400, message: "Password and confirmation do not match"}, null);
      }
    }
  });
};

userSchema.statics.authenticate = function(params, callback){
  this.findOne({username: params.name}, function(err, user){
    if(user){
      crypto.pbkdf2(
        params.password, 
        salt, 500, 128, 
        function(err, derivedKey){
          if(err) throw err;

          if(user.password_digest == derivedKey){
            callback(null, user); // everything checks out
          }
          else callback(401, null); //incorrect password
      });
    }
    else callback(404, null);// user not found 
  });
};

module.exports = mongoose.model('user', userSchema);
