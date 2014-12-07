var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postRelationSchema = new Schema({
  username: {type:String, index:true},
  post_id: {type:String, index:true},
  comment_count: Number,
  voted: Boolean,
  voted_comments: Array,
  favorited: Boolean,
  created_at: Date
});

postRelationSchema.statics.findOrCreate = function(params, callback){
  var PostRelation = this;

  PostRelation.findOne({ username: params.username, post_id: params.post_id}, function(err, postRelation){
    if(postRelation) callback(200, postRelation); // Return existing relation
    else{ // create new relation
      var postRelationObj = {
        username: params.username,
        post_id: params.post_id,
        favorited: false,
        voted: false,
        voted_comments: [],
        comment_count: 0,
        created_at: Date.now()
      };

      new PostRelation(postRelationObj).save(function(err, postRelation){
        if(err) throw err;
        if(postRelation) callback(201, postRelation); // success
        else callback(500, {message:"Internal server error"}); // error
      });
    }
  });
};

module.exports = mongoose.model('postRelation', postRelationSchema);
