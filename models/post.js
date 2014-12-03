var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  username: {type:String, index:true},
  title: String,
  content: String,
  karma: Number,
  created_at: Date
});

postSchema.statics.create = function(params, callback){
  var Post = this;

  Post.findOne({title: params.title}, function(err, post){
    if(post) callback(409); // post title conflict
    else{ // create new post
      var postHash = {
        username: params.username,
        title: params.title,
        content: params.content,
        karma:0,
        created_at: Date.now()
      };

      new Post(postHash).save(function(err, post){
        if(err) throw err;
        callback(200); // success!
      });
    }
  });
};

module.exports = mongoose.model('post', postSchema);
