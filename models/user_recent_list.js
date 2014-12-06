var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userRecentListSchema = new Schema({
  username: {type:String, index:true},
  items:[{
    post_title: {type:String, index:true},
    comment_id: Number,
    content: String,
    created_at: Date

  }],
  created_at: Date
});

userRecentListSchema.statics.addPost = function(params, callback){
  var RecentList = this;

  RecentList.findOne({username: params.username}, function(err, postRelation){
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
