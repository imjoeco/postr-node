var app = angular.module("postrApp",[]);

app.controller("appController",['$http','$scope', function($http, $scope){
  var postCtrl = this;

  this.currentUser = {};

  this.viewUser = {};
  this.viewPost = {};

  this.session = {};
  this.post = {};
  this.comment = {};
  this.user = {
    showNameError:false,
    showPassError:false,
    showPassConError:false
  };


  this.addingComment = false;
  this.clearout = false;
  this.showPostCheck = false;

  this.showMenu = function(){
    postCtrl.clearout = true;
  };

  this.hideMenu = function(){
    postCtrl.clearout = false;
  };

//  _____             _               _      _       _   
// |_   _|           | |             | |    (_)     | |  
//   | |   _ __    __| |  ___ __  __ | |     _  ___ | |_ 
//   | |  | '_ \  / _` | / _ \\ \/ / | |    | |/ __|| __|
//  _| |_ | | | || (_| ||  __/ >  <  | |____| |\__ \| |_
//  \___/ |_| |_| \__,_| \___|/_/\_\ \_____/|_||___/ \__|
                                                      
  this.setIndexControls = function(indexName){
    return new Promise(function(resolve, reject){
      if(indexName == "user"){
        postCtrl.indexControls = [
          {controller:"users", id:postCtrl.viewUser.name, action:'recent', title:'Recent'},
          {controller:"users", id:postCtrl.viewUser.name, action:'posts', title:'Top Posts'},
          {controller:"users", id:postCtrl.viewUser.name, action:'comments', title:'Top Comments'}
        ];
      }
      else{
        postCtrl.indexControls = [
          {controller:'posts', action:'index', title:'Latest'},
          {controller:'posts', action:'top', title:'Top'}
          // todo : add trending
        ];

        if(postCtrl.signedIn){
          postCtrl.indexControls.push({controller:'posts', action:'favorites', title:'Favorites'});
        }
      }
      resolve(postCtrl.indexControls);
    });
  };
                                                      

  this.loadIndexList = function(options){
    var modelName, 
        url = '/';

    if(typeof options.controller == "undefined"){
      options.controller = 'posts';
    }

    url = url + options.controller;
    modelName = 'index';

    if(options.id){
      url = url + '/' + options.id;
    }

    if(options.action){
      modelName = options.action;
      if(modelName != 'index') url = url + '/' + options.action;
    }

    if(postCtrl.indexView != modelName || options.force){

      if(options.controller != "users" && (typeof postCtrl[modelName] == "undefined" || options.force)){
        $http.get(url)
        .success(function(data){
          if(typeof data["items"] == "undefined"){
            postCtrl[modelName] = data;
            postCtrl.indexItems = data;
          }
          else{
            postCtrl[modelName] = data.items;
            postCtrl.indexItems = data.items;
          }
        });
      }
      else if(options.controller == "users" && typeof postCtrl.viewUser[modelName] == "undefined"){
        $http.get(url)
        .success(function(data){
          if(typeof data["items"] == "undefined"){
            postCtrl.viewUser[modelName] = data;
            postCtrl.indexItems = data;
          }
          else{
            postCtrl.viewUser[modelName] = data.items;
            postCtrl.indexItems = data.items;
          }
        });
      }
      else if(options.controller == "users"){
        postCtrl.indexItems = postCtrl.viewUser[modelName];
      }
      else{
        postCtrl.indexItems = postCtrl[modelName];
      }
      postCtrl.indexView = modelName;
    }

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.showIndex = function(options){
    if(!options) options = {};
    updateTitle();
    rootAddress = location.href.split("#")[0];
    if(!options.preserveState) history.pushState({controller: 'index'},document.title,'/');
    postCtrl.currentTab = 'index';
    postCtrl.showPostCheckButton();
    postCtrl.setIndexControls("posts")
    .then(function(indexControls){
      //indexView set by loadIndexList to 'index' or {:action} if present
      indexControls.findOrFirst("action",postCtrl.indexView)
        .then(function(control){
          if(options.force) control.force = true;
          postCtrl.loadIndexList(control);
          control.force = false;
        });
      $scope.$apply();
    });
  };
  
  this.showIndexItem = function(indexItem){
    if(typeof indexItem.title != "undefined"){
      postCtrl.showPost(indexItem)
      .then(function(post){
        index = postCtrl.indexItems.findIndex("id",post.id);
        if(index){
          post.loaded = true;
          postCtrl.indexItems[index] = post;
        }
      });
    }
    else{
      postCtrl.showComment(indexItem);
    }
  };

  this.showPostCheckButton = function(){
    setTimeout(function(){
      postCtrl.showPostCheck = true;
      $scope.$apply();
    },60000);
  };

  this.loadNextPosts = function(){
    nextStart = postCtrl.index[0].id + 1;
    
    $http.get('/posts?start_post='+nextStart)
    .success(function(data){
      if(data.length > 0){
        postCtrl.index.unshift(data);
      }
    });
    postCtrl.showPostCheck = false;
    postCtrl.showPostCheckButton();
  };

  this.loadPrevPosts = function(){
    previousStart = postCtrl.index[postCtrl.index.length-1].id - 1;
    
    $http.get('/posts?end_post='+previousStart)
    .success(function(data){
      postCtrl.index = postCtrl.index.concat(data);
      if(data.length < 5){
        postCtrl.outtaPosts = true;
      }
      postCtrl.indexItems = postCtrl.index;
    });
  };

// ______              _ 
// | ___ \            | |       
// | |_/ /  ___   ___ | |_  ___ 
// |  __/  / _ \ / __|| __|/ __|
// | |    | (_) |\__ \| |_ \__ \
// \_|     \___/ |___/ \__||___/
//

  this.newPost = function(options){
    if(typeof options == "undefined") options = {};
    if(typeof postCtrl.post._id != "undefined") postCtrl.post = {};

    updateTitle("New Post");

    rootAddress = location.href.split("#")[0];
    if(!options.preserveState){
      history.pushState(
        {post:{}},
        document.title,
        rootAddress + "#/posts/new"
      );
    }
    postCtrl.currentTab = 'form';
    document.getElementById("post_title").focus();

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.editPost = function(post){
    updateTitle("Edit Post");

    if(typeof post.content == "undefined"){
      $http.get('/posts/'+post._id)
        .success(function(data){
          postCtrl.post = {
            title:data.title,
            content:data.content,
            _id: data._id
          };
        });
    }

    else if(typeof postCtrl.post != "undefined"
    && postCtrl.post.title != post.title){
      postCtrl.post = {
        title:post.title,
        content:post.content,
        _id: post._id
      };
    }

    rootAddress = location.href.split("#")[0];
    if(!post.preserveState){
      history.pushState(
        {post:postCtrl.post},
        document.title,
        rootAddress + "#/posts/"+post._id+"/edit"
      );
    }

    postCtrl.currentTab = 'form';
    document.getElementById("post_title").focus();

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.exitForm = function(){
    if(location.href.indexOf("/posts/") != -1) postCtrl.currentTab = 'show';
    else postCtrl.currentTab = 'index';
  };

  this.savePost = function(){
    if(typeof postCtrl.post._id == "undefined"){
      $http.post('posts', postCtrl.post)
        .success(function(data){
          postCtrl.post = {};
          postCtrl.showIndex({force:true});
        })
        .error(function(data,status){
          postCtrl.post.errors = data.errors;
          if(status == 401) postCtrl.signOut();
        });
    }
    else{
      $http.put('/posts/'+postCtrl.post._id, postCtrl.post)
        .success(function(data){
          postCtrl.viewPost.title = postCtrl.post.title;
          postCtrl.viewPost.content = postCtrl.post.content;
          postCtrl.post = {};
          postCtrl.currentTab = 'show';
        })
        .error(function(data,status){
          postCtrl.post.errors = data.errors;
          if(status == 401) postCtrl.signOut();
        });
    }
  };

  this.loadPost = function(post){
    return new Promise(function(resolve,reject){
      //incase id submitted instead of post obj
      if(typeof post.content == "undefined" || typeof post.karma == "undefined"){
        viewPostExists = (typeof postCtrl.viewPost.id != "undefined");
        if(!viewPostExists || viewPostExists && postCtrl.viewPost._id != post){
          if(typeof post.post_id != "undefined") post = {id:post.post_id};
          if(typeof post.id == "undefined") post = {id:post};
          postCtrl.viewPost = {};

          $http.get('/posts/'+post.id)
          .success(function(data){
            postCtrl.viewPost = data;
            postCtrl.viewPost.id = data.title.convertToSlug();
            resolve(postCtrl.viewPost);
          });
        }
        else{
          resolve(postCtrl.viewPost);
        }
      }
      else{
        postCtrl.viewPost = post;
        postCtrl.viewPost.id = post.title.convertToSlug();
        resolve(post);
      }
    });
  }

  this.showPost = function(post){
    return new Promise(function(resolve,reject){
      postCtrl.loadPost(post)
      .then(function(){
        if(location.href.indexOf("posts") == -1){
          history.pushState(
            {post: postCtrl.viewPost.id},
            postCtrl.viewPost.title + " | Postr",
            location.href.split("#")[0]+"#/posts/"+postCtrl.viewPost._id + "/" + postCtrl.viewPost.title.convertToSlug()
          );
        }

        if(typeof postCtrl.viewPost.comments == "undefined"){
          //$http.get('/posts/'+postCtrl.viewPost.id+'/comments')
          $http.get('/comments/'+postCtrl.viewPost._id)
          .success(function(data){
            if(data.length > 0){
              postCtrl.viewPost.comments = data;
            }
          });
        }

        if(postCtrl.signedIn && typeof postCtrl.viewPost.postRelation == "undefined"){
          $http.get('/post_relations/'+postCtrl.viewPost._id)
          .success(function(data){
            postCtrl.viewPost.postRelation = data;
          })
          .error(function(data,status){
            if(status == 401) postCtrl.signOut();
          });
        }

        updateTitle(postCtrl.viewPost.title);
        postCtrl.viewPost.loaded = true;
        postCtrl.addingComment = false;
        postCtrl.currentTab = 'show';
        postCtrl.viewPost.commentIndex = 'created_at';
        $scope.$apply();
        resolve(postCtrl.viewPost);
      });
    });
 };
 
  this.vote = function(post){
    if(postCtrl.viewPost.postRelation.voted && confirm("Remove vote?") || !postCtrl.viewPost.postRelation.voted){
      $http.head('/posts/'+post._id+'/vote')
      .success(function(){
        postCtrl.viewPost.postRelation.voted = !postCtrl.viewPost.postRelation.voted;
        postCtrl.viewPost.karma += (postCtrl.viewPost.postRelation.voted)?1:-1;
      })
      .error(function(data, status){
        if(status == 304) alert("Post already voted on.");
        if(status == 401) postCtrl.signOut();
      });
    }
  };

  this.favorite = function(){
    $http.head('/posts/'+postCtrl.viewPost._id+'/favorite')
    .success(function(){
      postCtrl.viewPost.postRelation.favorited = !postCtrl.viewPost.postRelation.favorited;
      if(typeof postCtrl.favorites == "undefined") postCtrl.favorites = [];
      if(index = postCtrl.favorites.findIndex("id",postCtrl.viewPost.id)){
        postCtrl.favorites.splice(index,1);
      }
      else{
        postCtrl.favorites.unshift(postCtrl.viewPost);
      }
    })
    .error(function(data,status){
      if(status == 304) alert("Operation could not be performed.");
      if(status == 401) postCtrl.signOut();
      if(status == 404) alert("Operation could not be performed.");
    });
  };


//  _____                                            _        
// /  __ \                                          | |       
// | /  \/  ___   _ __ ___   _ __ ___    ___  _ __  | |_  ___ 
// | |     / _ \ | '_ ` _ \ | '_ ` _ \  / _ \| '_ \ | __|/ __|
// | \__/\| (_) || | | | | || | | | | ||  __/| | | || |_ \__ \
//  \____/ \___/ |_| |_| |_||_| |_| |_| \___||_| |_| \__||___/

  this.saveComment = function(){
    postCtrl.comment.post_id = postCtrl.viewPost._id;

    $http.post('/comments', postCtrl.comment)
      .success(function(data){
        if(typeof postCtrl.viewPost.comments != "undefined"){
          postCtrl.viewPost.comments.unshift(data);
        }
        else{
          postCtrl.viewPost.comments = [data];
        }
        postCtrl.viewPost.postRelation.comment_count = data.content.length;
        postCtrl.addingComment = false;
        postCtrl.comment = {};
      })
      .error(function(data, status){
        if(status == 401) postCtrl.signOut();
      });
  };
                                                           
  this.showComment = function(comment){
    postCtrl.showPost(comment.post_id)
    .then(function(post){
      postCtrl.viewPost.featuredComment = comment;
    });
  };

  this.sortCommentsBy = function(attr){
    postCtrl.viewPost.comments.sortBy(attr);
    postCtrl.viewPost.commentIndex = attr;
  };

  this.commentVote = function(comment){
    $http.head('/comments/'+comment._id+'/vote')
    .success(function(){
      votedComments = postCtrl.viewPost.postRelation.voted_comments;
      commentIndex = votedComments.indexOf(comment._id);
      if(commentIndex == -1){
        comment.karma += 1;
        votedComments.push(comment._id);
      }
      else{
        comment.karma -= 1;
        votedComments.splice(commentIndex,1);
      }
    })
    .error(function(data, status){
      if(status == 304) alert("Vote could not be completed.");
      if(status == 401) postCtrl.signOut();
    });
  }

//   _   _ 
//  | | | |                      
//  | | | | ___   ___  _ __  ___ 
//  | | | |/ __| / _ \| '__|/ __|
//  | |_| |\__ \|  __/| |   \__ \
//   \___/ |___/ \___||_|   |___/
//

  this.showUserForm = function(options){
    if(!options) options = {};
    updateTitle("Sign Up");

    postCtrl.user = {
      name:postCtrl.session.name,
      password:postCtrl.session.password
    };

    rootAddress = location.href.split("#")[0];
    if(options && !options.preserveState){
      history.pushState(
        {user:postCtrl.user},
        document.title,
        rootAddress + "#/signup"
      );
    }

    //userForm.user_name.focus();
    postCtrl.currentTab = 'signup';

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.signUp = function(){
    $http.post('/users', postCtrl.user)
    .success(function(data){
      console.dir(data);
      postCtrl.currentUser = {name:data.username};
      postCtrl.signedIn = true;
      postCtrl.currentTab = 'index';
    })
    .error(function(data){
      postCtrl.user.errors = data.errors;
    });
  };

  this.passwordCheck = function(){
    valid = (postCtrl.user.password == postCtrl.user.password_confirmation)
    $scope.userForm.user_password_confirmation.$setValidity("passwordsMismatch",valid);
  };

  this.editUser = function(user){
    if(typeof user == "undefined") user = {};
    updateTitle("Edit Profile");

    if(typeof postCtrl.viewUser.about_me == "undefined"){
      $http.get('/users/'+user.username)
        .success(function(data){
          postCtrl.viewUser = data;
          postCtrl.user = data;

          postCtrl.viewUser.editingAboutMe = true;
        });
      postCtrl.currentTab = 'user';
    }
    else postCtrl.user = postCtrl.viewUser;

    rootAddress = location.href.split("#")[0];
    if(!user.preserveState){
      history.pushState(
        {user:postCtrl.user},
        document.title,
        rootAddress + "#/users/"+postCtrl.viewUser.name+"/edit"
      );
    }

    postCtrl.viewUser.editingAboutMe = true;

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.updateAboutMe = function(){
    $http.put('/users/'+postCtrl.currentUser.name, postCtrl.user)
    .success(function(){
      postCtrl.viewUser.about_me = postCtrl.user.about_me;
      postCtrl.viewUser.editingAboutMe = false;
    })
    .error(function(data, status){
      if(status == 304) alert("Changes could not be saved.");
      if(status == 401) postCtrl.signOut();
    });
  };

  this.loadUser = function(userId){
    return new Promise(function(resolve, reject){
      if(!postCtrl.viewUser.id || postCtrl.viewUser.id != userId){
        $http.get('/users/'+userId)
        .success(function(data){
          postCtrl.viewUser = data;
          resolve(data);
        });
      }
      else{
        resolve(postCtrl.viewUser);
      }
    });
  };

  this.showUser = function(options){
    if(typeof options != "object") options = {userId:options};
    postCtrl.hideMenu();

    postCtrl.loadUser(options.userId)
    .then(function(user){
      updateTitle(user.name);
      rootAddress = location.href.split("#")[0];

      if(!options.preserveState){
        history.pushState(
          {user: user},
          document.title,
          rootAddress + "#/users/" + user.name
        );
      }

      postCtrl.setIndexControls("user")
      .then(function(indexControls){
        //indexView set by loadIndexList to 'index' or {:action} if present
        indexControls.findOrFirst("action",postCtrl.indexView)
        .then(function(control){
          postCtrl.loadIndexList(control);
          postCtrl.currentTab = 'user';
          $scope.$apply();
        });
      });
    });

  };
//    _____                      _                       
//   / ____|                    (_)                      
//  | (___     ___   ___   ___   _    ___    _ __    ___ 
//   \___ \   / _ \ / __| / __| | |  / _ \  | '_ \  / __|
//   ____) | |  __/ \__ \ \__ \ | | | (_) | | | | | \__ \
//  |_____/   \___| |___/ |___/ |_|  \___/  |_| |_| |___/
//

  this.showSessionForm = function(options){
    if(!options) options = {};
    updateTitle("Sign In");

    rootAddress = location.href.split("#")[0];
    if(!options.preserveState){
      history.pushState(
        {user:postCtrl.user},
        document.title,
        rootAddress + "#/signin"
      );
    }

    postCtrl.currentTab = 'signin';

    //auto-fill workaround for form validation
    //postCtrl.session.name = sessionForm.session_name.value;
    //postCtrl.session.password = sessionForm.session_password.value;

    //sessionForm.session_name.focus();
    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.signIn = function(){
    $http.post('users/signin', postCtrl.session)
      .success(function(data){
        postCtrl.currentUser.name = document.cookie.replace(/(.*)username=/,"").replace(/;(.*)/,"");
        postCtrl.currentUser.id = postCtrl.currentUser.name;

        postCtrl.session = {};
        postCtrl.signedIn = true;
        postCtrl.showIndex();
      })
      .error(function(data,status){
        if(status == 404) postCtrl.session.errors = ["Name not found"];
        if(status == 401) postCtrl.session.errors = ["Incorrect password"];
      });
  }

  this.signOut = function(){

    // this should be reimplemented for ip logging
    //$http.get("/signout")
    //  .success(function(){
    //  })
    //  .error(function(){
    //    document.cookie = 'remember_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    //  });
    document.cookie = 'remember_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    postCtrl.currentUser = {};
    postCtrl.clearout = false;
    postCtrl.signedIn = false;
    postCtrl.showSessionForm();
    //postCtrl.currentTab = 'signin';
  };

  this.timeAgo = function(dateObj){
    return new Date(dateObj).toRelativeTime(60000);
  }
  
// ______                _    _               
// | ___ \              | |  (_)              
// | |_/ /  ___   _   _ | |_  _  _ __    __ _ 
// |    /  / _ \ | | | || __|| || '_ \  / _` |
// | |\ \ | (_) || |_| || |_ | || | | || (_| |
// \_| \_| \___/  \__,_| \__||_||_| |_| \__, |
//                                       __/ |
//                                      |___/ 

  window.addEventListener('popstate', function(){
    postCtrl.loadRoute();
    $scope.$apply();
  }, false);

  this.loadCurrentUser = function(){
    if(typeof postCtrl.currentUser.name == "undefined"){
      postCtrl.currentUser = {
        name:document.cookie.replace(/(.*)username=/,"").replace(/;(.*)/,"")
      };
    }
  };

  this.loadRoute = function(){
    postCtrl.clearout = false;
    postCtrl.signedIn = (document.cookie.indexOf("remember_token") != -1);

    if(postCtrl.signedIn) postCtrl.loadCurrentUser();

    urlController = location.href.split("#/")[1];

    if(typeof urlController != "undefined"){
      urlController = urlController.split("/")[0];
      urlId = location.href.split("#/")[1].split("/")[1];
      urlAction = location.href.split("#/")[1].split("/")[2];

      if(urlController == "posts"){
        if(urlId == "new") postCtrl.newPost({preserveState:true});
        else if(urlAction == "edit"){
          postCtrl.editPost({_id: urlId, preserveState:true});
        }
        else postCtrl.showPost(urlId);
      }
      else if(urlController == "users") 
        if(urlAction == "edit"){
          postCtrl.editUser({username:urlId, preserveState:true});
        }
        else postCtrl.showUser({userId:urlId,preserveState:true});
      else if(urlController == "signup")
        postCtrl.showUserForm({preserveState:true});
      else if(urlController == "signin")
        postCtrl.showSessionForm({preserveState:true});
      else postCtrl.showIndex();
    }
    else{
      postCtrl.showIndex({preserveState:true});
    }
  };

  postCtrl.loadRoute();
}]);

// ______ _               _   _                
// |  _  (_)             | | (_)               
// | | | |_ _ __ ___  ___| |_ ___   _____  ___ 
// | | | | | '__/ _ \/ __| __| \ \ / / _ \/ __|
// | |/ /| | | |  __/ (__| |_| |\ V /  __/\__ \
// |___/ |_|_|  \___|\___|\__|_| \_/ \___||___/

// These should probably be moved to the top of the app to avoid
// methods calling unavailable html

//app.directive("header", function(){
//  return {restrict:'E', templateUrl:'header.html'};
//});
//
////   _   _                
////  | | | |___ ___ _ _ ___
////  | |_| (_-</ -_) '_(_-<
////   \___//__/\___|_| /__/
//
//app.directive("users",function(){
//  return {restrict:'E'};
//});
//
//app.directive("userShow", function(){
//  return {restrict:'E', templateUrl:'user-show.html'};
//});
//
//app.directive("userSignin", function(){
//  return {restrict:'E', templateUrl:'user-signin.html'};
//});
//
//app.directive("userSignup", function(){
//  return {restrict:'E', templateUrl:'user-signup.html'};
//});
//
////   ___        _      
////  | _ \___ __| |_ ___
////  |  _/ _ (_-<  _(_-<
////  |_| \___/__/\__/__/
//
//app.directive("posts",function(){
//  return {restrict:'E'};
//});
//
//app.directive("postIndex",function(){
//  return {restrict:'E', templateUrl: 'post-index.html'};
//});
//
//app.directive("postShow",function(){
//  return {restrict:'E', templateUrl: 'post-show.html'};
//});
//
//app.directive("postForm",function(){
//  return {restrict:'E', templateUrl: 'post-form.html'};
//});

//    ___                         _      
//   / __|___ _ __  _ __  ___ _ _| |_ ___
//  | (__/ _ \ '  \| '  \/ -_) ' \  _(_-<
//   \___\___/_|_|_|_|_|_\___|_||_\__/__/

app.directive("comments", function(){
  return {restrict:'E'};
});

app.directive("commentIndex", function(){
  return {restrict:'E', templateUrl:'comment-index.html'};
});

app.directive("commentForm", function(){
  return {restrict:'E', templateUrl:'comment-form.html'};
});

//   _   _ _   _  _  _ _   _           
//  | | | | | (_)| |(_) | (_)          
//  | | | | |_ _ | | _| |_ _  ___  ___ 
//  | | | | __| || || | __| |/ _ \/ __|
//  | |_| | |_| || || | |_| |  __/\__ \
//   \___/ \__|_||_||_|\__|_|\___||___/

function updateTitle(title){
  if(title){
    document.title = title + " | Postr"; 
  }
  else{
    document.title = "Postr";
  }
};

String.prototype.convertToSlug = function(){
  return text = this
    .toLowerCase()
    .replace(/ /g,'-')
    .replace(/[^\w-]+/g,'');

}

Array.prototype.sortBy = function(key){
  if(typeof this != "object" || typeof key != "string") return false;

  if(typeof this[0][key] != "undefined"){
    array = this.sort(function(a,b){
      if(a[key] < b[key]) return 1;
      else if(a[key] > b[key]) return -1;
      else return 0;
    });
  }

  if(!array) array = false;

  return array;
}

Array.prototype.findOrFirst = function(key, value){
  var array = this;
  return new Promise(function(resolve, reject){
    if(typeof value != "undefined"){
      for(var i in array){
        if(typeof array[i] == "object" && array[i][key] == value) resolve(array[i]);
      }
    }

    resolve(array[0]);
  });
};

Array.prototype.findIndex = function(key, value){
  for(var i in this){
    if(this[i][key] == value) return i;
  }

  return false;
};
