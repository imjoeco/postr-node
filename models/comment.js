var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  username: {type:String, index:true},
  post_title: {type:String, index:true},
  content: String,
  karma: Number,
  created_at: Date
});

commentSchema.statics.create = function(params, callback){
  var Comment = this;

  Comment.findOne({post_title: params.post_title, username: params.username}, function(err, comment){
    if(comment) callback(409, comment); // post title conflict
    else{ // create new post
      var commentHash = {
        username: params.username,
        post_title: params.post_title,
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
