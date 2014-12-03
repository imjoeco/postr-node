var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postRelationSchema = new Schema({
  username: {type:String, index:true},
  post_title: {type:String, index:true},
  comment_count: Number,
  voted: Boolean,
  voted_comments: Array,
  favorited: Boolean,
  created_at: Date
});

postRelationSchema.statics.findOrCreate = function(params, callback){
  var PostRelation = this;

  PostRelation.findOne({post_title: params.post_title, username: params.username}, function(err, postRelation){
    if(postRelation) callback(200, postRelation); // Return existing relation
    else{ // create new relation
      var postRelationObj = {
        username: params.username,
        post_title: params.post_title,
        favorited: false,
        voted: false,
        voted_comments: [],
        comment_count: 0,
        created_at: Date.now()
      };

      new PostRelation(postRelationObj).save(function(err, postRelation){
        if(err) throw err;
        callback(201, postRelation); // success!
      });
    }
  });
};

module.exports = mongoose.model('postRelation', postRelationSchema);
