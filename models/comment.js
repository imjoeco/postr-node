var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  username: String,
  user_id: {type:String, index:true},
  post_id: {type:String, index:true},
  content: String,
  karma: Number,
  created_at: Date
});

commentSchema.statics.create = function(params, callback){
  var Comment = this;

  Comment.findOne({post_id: params.post_id, user_id: params.user._id}, function(err, comment){
    if(comment) callback(409, comment); // post title conflict
    else{ // create new post
      var commentHash = {
        username: params.user.username,
        user_id: params.user._id,
        post_id: params.post_id,
        content: params.content,
        karma:0,
        created_at: Date.now()
      };

      new Comment(commentHash).save(function(err, comment){
        if(err) throw err;
        callback(201, comment); // success!
      });
    }
  });
};

module.exports = mongoose.model('comment', commentSchema);
