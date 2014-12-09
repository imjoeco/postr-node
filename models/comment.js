var mongoose = require('mongoose');
var User = require('./user');
var PostRelation = require('./post_relation');

var commentSchema = new mongoose.Schema({
  username: String,
  user_id: {type:String, index:true},
  post_id: {type:String, index:true},
  content: String,
  karma: Number,
  created_at: Date
});

commentSchema.statics.create = function(params, callback){
  var Comment = this;

  Comment.findOne({
    post_id: params.post_id, 
    user_id: params.user._id
  }, function(err, comment){
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
        if(err) console.log(err);
        if(comment){
          // bump comment count for post relation
          PostRelation.findOne({
            post_id: comment.post_id, 
            username: comment.username
          }, function(err, postRelation){
            postRelation.comment_count++;
            postRelation.save();
          });

          // auto-bump comment karma for creator
          comment.karmaBump(comment.user_id, callback);
        }
      });
    }
  });
};

commentSchema.methods.karmaBump = function(userId, callback){
  var comment = this;

  PostRelation.findOne({
    user_id: userId,
    post_id: comment.post_id
  }, function(err, postRelation){
    if(postRelation){
      // bump karma for comment
      var commentIndex = postRelation.voted_comments.indexOf(comment._id);
      ~commentIndex ? comment.karma-- : comment.karma++;
      comment.save(function(err, comment){
        if(comment){ 
          // users can't bump their own user karma
          if(comment.user_id != userId){
            // bump user karma
            User.findOne({_id:comment.user_id},function(err, user){
              ~commentIndex ? user.karma-- : user.karma++;
              user.save();
            });
          }

          // log comment id to post relation voted comment list
          if(~commentIndex) postRelation.voted_comments.splice(commentIndex,1);
          else postRelation.voted_comments.push(comment._id);
          postRelation.save(function(err, postRelation){
            if(postRelation) callback(200, comment); // success
            else callback(500,{message:"Internal server error"});
          });
        }
        else callback(404,{message:"Comment not found"});
      });
    }
    else callback(404,{message:"Post relation not found"});
  });
}

module.exports = mongoose.model('comment', commentSchema);
