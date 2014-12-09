var mongoose = require('mongoose');
var User = require('./user');
var PostRelation = require('./post_relation');
var FavoriteList = require('./favorite_list');

var postSchema = new mongoose.Schema({
  username: String,
  user_id: {type:String, index:true},
  title: String,
  content: String,
  karma: Number,
  favorite_count: Number,
  created_at: Date
});

postSchema.statics.create = function(params, callback){
  var Post = this;

  // avoid edit conflict for front end router
  if(/edit/i.test(params.title)) return callback(409);

  Post.findOne({
    title: new RegExp(params.title,"i"), 
    user_id: params.user_id
  }, function(err, post){
    if(post) callback(409); // post title conflict
    else{ // create new post
      var postHash = {
        username: params.username,
        user_id: params.user_id,
        title: params.title,
        content: params.content,
        karma:0,
        favorite_count:0,
        created_at: Date.now()
      };

      new Post(postHash).save(function(err, post){
        if(err) throw err;

        // create post relation for creator
        PostRelation.findOrCreate({
          user_id:post.user_id, 
          post_id: post._id,
          username: post.username
        },function(statusCode,responseBody){
          // auto-bump post for creator
          post.karmaBump({
            username:post.username, 
            _id: post.user_id
          }, function(statusCode,responseBody){
            callback(201); // all done
          });
        });
      });
    }
  });
};

postSchema.methods.favorite = function(user_id, callback){
  var post = this;

  PostRelation.findOne({
    user_id: user_id,
    post_id: post._id
  }, function(err, postRelation){
    if(postRelation){
      // bump karma for post
      postRelation.favorited ? post.favorite_count-- : post.favorite_count++;
      post.save();

      postRelation.favorited = !postRelation.favorited;
      postRelation.save();

      FavoriteList.findOrCreate({username: postRelation.username},function(favoriteList){
        if(postRelation.favorited){
          favoriteList.items.push({
            title: post.title,
            post_id: post._id
          });

          favoriteList.save();
        }
        else{
          favoriteList.items.forEach(function(item, index){
            if(item.post_id == post._id){
              favoriteList.items.splice(index, 1);
              favoriteList.save();
            }
          });
        }
        callback(200, post);
      });
    }
  });
};

postSchema.methods.karmaBump = function(userId, callback){
  var post = this;

  PostRelation.findOne({
    user_id: userId,
    post_id: post._id
  }, function(err, postRelation){
    if(postRelation){
      // bump karma for post
      postRelation.voted ? post.karma-- : post.karma++;
      post.save(function(err, post){
        if(post){ 
          // users can't bump their own user karma
          if(post.user_id != userId){
            // bump user karma
            User.findOne({_id:post.user_id},function(err, user){
              postRelation.voted ? user.karma-- : user.karma++;
              user.save();
            });
          }

          // log vote state for user
          postRelation.update({
            voted: postRelation.voted ? false : true
          }, function(err, postRelation){
            if(postRelation) callback(200, post); // success
            else callback(500,{message:"Internal server error : Post Relation"});
          });
        }
        else callback(500,{message:"Internal server error : Post"});
      });
    }
    else callback(404,{message:"Post relation not found"});
  });
}

postSchema.methods.destroy = function(){
};
module.exports = mongoose.model('post', postSchema);
