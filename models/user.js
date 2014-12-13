var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var smtpTransport = require('nodemailer').createTransport({
  service:'Zoho', // Service list at https://github.com/andris9/nodemailer-wellknown
  auth:{
    user: 'usernameHere',
    pass: 'passwordHere'
  }
});

var userSchema = new Schema({
  username: {type: String, index: true},
  email: {type: String, index: true},
  password_digest: String,
  remember_token: String,
  confirmation_code: String,
  email_attempts:Number,
  karma:Number,
  editor:Boolean,
  about_me:String,
  created_at: Date
});

userSchema.statics.create = function(params, callback){
  var User = this;
  if(params.password == params.password_confirmation){
    User.findOne({username:params.name},function(err, user){
      if(err) console.log(err);
      if(user){ // User with identical username exists
        callback({code:403, message: "Username already taken."}, null);
      }
      else{ // No user found: Create new user
        User.findOne({email:params.email},function(err, user){
          if(err) console.log(err);
          if(user){ // Email already registered
            callback({code:409, message: "Email already registered."}, null);
          }
          else{
            bcrypt.hash(params.password, 10, function(err, hash){
              var userHash = {
                password_digest: hash,
                remember_token: crypto.createHash('sha256').digest('base64'),
                confirmation_code: crypto.createHash('md5').digest('base64'),
                email:params.email,
                email_attempts:0,
                username: params.name,
                editor:false,
                karma:1,
                created_at: Date.now()
              };

              new User(userHash).save(function(err, user){
                if(err) throw err;
                
                user.sendConfirmation(function(statusCode){
                  user._v = null;
                  user.password_digest = "[FILTERED]";

                  callback(null, user);
                });
              });
            });
          }
        });
      }
    });
  }
  else{ // password and confirm don't match
    callback({code:400, message: "Password and confirmation do not match"}, null);
  }
};

// Send confirmation email
userSchema.methods.sendConfirmation = function(callback){
  var user = this;
  if(user.email_attempts < 6){
    user.email_attempts++;
    user.save();

    smtpTransport.sendMail({
      from:'Postr Team <noreply@postr.pw>',
      to: user.email,
      subject:'Welcome to Postr',
      text:'Hi '+user.username+' and welcome to Postr! \n\nPlease click the link below to finalize your account. \n\nhttp://localhost:3000/users/'+user.username+'/confirm/'+ user.confirmation_code
    }, function(err, info){
      if(err) console.log(err);
      else if(callback) callback(200);
    });
  }
  else if(callback) callback(409);
};

// Check Password for Signin
userSchema.statics.authenticate = function(params, callback){
  var query = ~params.name.indexOf("@") ? 
    {email: new RegExp(params.name,"i")} : 
    {username: new RegExp(params.name,"i")};

  this.findOne(query, function(err, user){
    if(user){ // User found
      if(!user.confirmation_code){ // Confirmed User
        bcrypt.compare(params.password, user.password_digest, function(err, correctPassword){
          // Return authenticated user for client-side sign in
          if(correctPassword) callback(null, user.session_safe());
          else callback(401, null); // Unauthorized
        });
      }
      else{ // Unconfirmed user
        bcrypt.compare(params.password, user.password_digest, function(err, correctPassword){
          // Authenticated but unconfirmed
          if(correctPassword) callback(403, user.email_safe());
          else callback(401, null); // Unauthorized
        });
      }
    }
    else callback(404, null);// User not found 
  });
};

// Clean up private fields
userSchema.methods.email_safe = function(){
  return {
    username: this.username,
    email: this.email
  }
};

// Clean up private fields
userSchema.methods.json_safe = function(){
  return {
    username: this.username,
    about_me: this.about_me,
    karma: this.karma
  }
};

// Clean up private fields
userSchema.methods.session_safe = function(){
  return {
    username: this.username,
    email: this.email,
    remember_token: this.remember_token
  }
};

module.exports = mongoose.model('user', userSchema);
