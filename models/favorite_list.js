var mongoose = require('mongoose');

var favoriteListSchema = new mongoose.Schema({
  username: {type:String, index:true},
  items:[{
    title: String,
    post_id: {type:String, index:true}
  }],
  created_at: Date
});

favoriteListSchema.statics.findOrCreate = function(params, callback){
  var FavoriteList = this;
  FavoriteList.findOne({username: params.username}, function(err, list){
    if(list) callback(list);
    else{
      var listHash = {
        username: params.username,
        items: [],
        created_at: Date.now()
      };

      new FavoriteList(listHash).save(function(err, list){
        if(err) throw err;

        if(list) callback(list);
        else callback(null);
      });
    }
  });
};

favoriteListSchema.methods.findItem = function(search, callback){
  var items = this.items;
  items.forEach(function(item, index){
    if(item.post_title == search) callback(item); 
    else if(item.comment_id == search) callback(item); 
    else if(index == items.length - 1) callback(null);
  });
};

favoriteListSchema.methods.findAndDelete = function(search, callback){
  var list = this;
  list.items.forEach(function(item, index){
    if(item.post_title == search || item.comment_id == search){
      list.items.id(item._id).remove(); 
      callback(list); 
    }
    else if(index == items.length - 1) callback(null);
  });
};

favoriteListSchema.methods.addPost = function(post, callback){
  var list = this;

  list.items.forEach(function(item, index){
    if(item.post_title == post.title){
      list.items.id(item._id).remove(); 
    }
  });

  if(list.items.length == 30) list.items.pop();

  console.log(list);
};

favoriteListSchema.methods.addOrUpdate = function(params, callback){
  var list = this;

  list.items.forEach(function(item, index){
    if(item.post_title == params.title || item.comment_id == params._id){
      list.items.id(item._id).remove(); 
    }
  });

  list.items

  console.log(list);
  
  //console.log(list.findItemByPostTitle("
  //list.items.push(params);
  //list.items.push({
  //  post_title: params.title,
  //  karma: params.karma,
  //  content: params.content,
  //  created_at: params.created_at
  //});

  //list.save(function(err, list){
  //  callback(list);
  //});

  //if(params.post_title){
  //  console.log(this);
  //}

//  if current = self.items.index { |post| post[:id] == item[:id] }
//    self.items.delete_at(current)
//  end

//  if self.items.length < 30 || item[:karma] >= self.low_karma
//    if self.items.length >= 30
//      self.items.pop
//    end
//    
//    new_location = self.items.index { |post| post[:karma] < item[:karma] }
//    new_item = {
//      title:item[:title],
//      id:item[:id],
//      karma:item[:karma],
//      created_at:item[:created_at]
//    }
//    if new_location
//      self.items.insert(new_location, new_item)
//    else
//      self.items.push(new_item)
//    end
//
//    self.low_karma = self.items.last[:karma]
//
//    self.save
//  end
//  var userList = this;
//  console.log(list);
//  console.log(params);


//  userList.update(params, function(err, list){
//    if(list) callback(list);
//    else callback(null);
//  });
};

//userRecentListSchema.statics.addPost = function(params, callback){
//  var RecentList = this;
//
//  RecentList.findOne({username: params.username}, function(err, postRelation){
//    if(postRelation) callback(200, postRelation); // Return existing relation
//    else{ // create new relation
//      var postRelationObj = {
//        username: params.username,
//        post_title: params.post_title,
//        favorited: false,
//        voted: false,
//        voted_comments: [],
//        comment_count: 0,
//        created_at: Date.now()
//      };
//
//      new PostRelation(postRelationObj).save(function(err, postRelation){
//        if(err) throw err;
//        callback(201, postRelation); // success!
//      });
//    }
//  });
//};

module.exports = mongoose.model('favoriteList', favoriteListSchema);
