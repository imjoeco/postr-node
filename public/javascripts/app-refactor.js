var POSTR = {
  currentUser:{},
  currentTab:"index",

  viewUser:{},
  viewPost:{},

  session:{},
  post:{},
  comment:{},
  user:{
    showNameError:false,
    showPassError:false,
    showPassConError:false
  }
};

POSTR.app = angular.module("postrApp",["layout"]);

// ______ _               _   _                
// |  _  (_)             | | (_)               
// | | | |_ _ __ ___  ___| |_ ___   _____  ___ 
// | | | | | '__/ _ \/ __| __| \ \ / / _ \/ __|
// | |/ /| | | |  __/ (__| |_| |\ V /  __/\__ \
// |___/ |_|_|  \___|\___|\__|_| \_/ \___||___/

// These should probably be moved to the top of the app to avoid
// methods calling unavailable html


//   _   _                
//  | | | |___ ___ _ _ ___
//  | |_| (_-</ -_) '_(_-<
//   \___//__/\___|_| /__/

POSTR.app.directive("users",function(){
  return {
    restrict:'E',
    controller: function(){
      this.signUp = function(){
        $http.post('/users', appCtrl.user)
        .success(function(data){
          console.dir(data);
          appCtrl.currentUser = {name:data.username};
          appCtrl.signedIn = true;
          appCtrl.currentTab = 'index';
        })
        .error(function(data){
          appCtrl.user.errors = data.errors;
        });
      };

      this.editUser = function(user){
        if(typeof user == "undefined") user = {};
        updateTitle("Edit Profile");

        if(typeof appCtrl.viewUser.about_me == "undefined"){
          $http.get('/users/'+user.username)
            .success(function(data){
              appCtrl.viewUser = data;
              appCtrl.user = data;

              appCtrl.viewUser.editingAboutMe = true;
            });
          appCtrl.currentTab = 'user';
        }
        else appCtrl.user = appCtrl.viewUser;

        rootAddress = location.href.split("#")[0];
        if(!user.preserveState){
          history.pushState(
            {user:appCtrl.user},
            document.title,
            rootAddress + "#/users/"+appCtrl.viewUser.name+"/edit"
          );
        }

        appCtrl.viewUser.editingAboutMe = true;

        if(!$scope.$$phase){
          $scope.$apply();
        }
      };

      this.updateAboutMe = function(){
        $http.put('/users/'+appCtrl.currentUser.name, appCtrl.user)
        .success(function(){
          appCtrl.viewUser.about_me = appCtrl.user.about_me;
          appCtrl.viewUser.editingAboutMe = false;
        })
        .error(function(data, status){
          if(status == 304) alert("Changes could not be saved.");
          if(status == 401) appCtrl.signOut();
        });

        this.passwordCheck = function(){
          valid = (appCtrl.user.password == appCtrl.user.password_confirmation)
          $scope.userForm.user_password_confirmation.$setValidity("passwordsMismatch",valid);
        };
      };
    },
    controllerAs: "usersCtrl"
  };
});

POSTR.app.directive("userShow", function(){
  return {restrict:'E', templateUrl:'user-show.html'};
});

POSTR.app.directive("userSignin", function(){
  return {restrict:'E', templateUrl:'user-signin.html'};
});

POSTR.app.directive("userSignup", function(){
  return {restrict:'E', templateUrl:'user-signup.html'};
});

//   ___        _      
//  | _ \___ __| |_ ___
//  |  _/ _ (_-<  _(_-<
//  |_| \___/__/\__/__/

POSTR.app.directive("posts",function(){
  return {restrict:'E'};
});

POSTR.app.directive("postIndex",function(){
  return {
    restrict:'E', 
    templateUrl: 'post-index.html',
    controller: function(){
      this.newPost = function(options){
        if(typeof options == "undefined") options = {};
        if(typeof appCtrl.post._id != "undefined") appCtrl.post = {};

        updateTitle("New Post");

        rootAddress = location.href.split("#")[0];
        if(!options.preserveState){
          history.pushState(
            {post:{}},
            document.title,
            rootAddress + "#/posts/new"
          );
        }
        appCtrl.currentTab = 'form';
        document.getElementById("post_title").focus();

        if(!$scope.$$phase){
          $scope.$apply();
        }
      };
    },
    controllerAs:"postCtrl"
  };
});

POSTR.app.directive("postShow",function(){
  return {restrict:'E', templateUrl: 'post-show.html'};
});

POSTR.app.directive("postForm",function(){
  return {restrict:'E', templateUrl: 'post-form.html'};
});

//    ___                         _      
//   / __|___ _ __  _ __  ___ _ _| |_ ___
//  | (__/ _ \ '  \| '  \/ -_) ' \  _(_-<
//   \___\___/_|_|_|_|_|_\___|_||_\__/__/

POSTR.app.directive("comments", function(){
  return {restrict:'E'};
});

POSTR.app.directive("commentIndex", function(){
  return {restrict:'E', templateUrl:'comment-index.html'};
});

POSTR.app.directive("commentForm", function(){
  return {restrict:'E', templateUrl:'comment-form.html'};
});

POSTR.app.controller("appController",['$http','$scope', function($http, $scope){
  var appCtrl = this;

  this.addingComment = false;
  this.clearout = false;
  this.showPostCheck = false;

  this.showMenu = function(){
    appCtrl.clearout = true;
  };

  this.hideMenu = function(){
    appCtrl.clearout = false;
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
        appCtrl.indexControls = [
          {controller:"users", id:appCtrl.viewUser.name, action:'recent', title:'Recent'},
          {controller:"users", id:appCtrl.viewUser.name, action:'posts', title:'Top Posts'},
          {controller:"users", id:appCtrl.viewUser.name, action:'comments', title:'Top Comments'}
        ];
      }
      else{
        appCtrl.indexControls = [
          {controller:'posts', action:'index', title:'Latest'},
          {controller:'posts', action:'top', title:'Top'}
          // todo : add trending
        ];

        if(appCtrl.signedIn){
          appCtrl.indexControls.push({controller:'posts', action:'favorites', title:'Favorites'});
        }
      }
      resolve(appCtrl.indexControls);
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

    if(appCtrl.indexView != modelName || options.force){

      if(options.controller != "users" && (typeof appCtrl[modelName] == "undefined" || options.force)){
        $http.get(url)
        .success(function(data){
          if(typeof data["items"] == "undefined"){
            appCtrl[modelName] = data;
            appCtrl.indexItems = data;
          }
          else{
            appCtrl[modelName] = data.items;
            appCtrl.indexItems = data.items;
          }
        });
      }
      else if(options.controller == "users" && typeof appCtrl.viewUser[modelName] == "undefined"){
        $http.get(url)
        .success(function(data){
          if(typeof data["items"] == "undefined"){
            appCtrl.viewUser[modelName] = data;
            appCtrl.indexItems = data;
          }
          else{
            appCtrl.viewUser[modelName] = data.items;
            appCtrl.indexItems = data.items;
          }
        });
      }
      else if(options.controller == "users"){
        appCtrl.indexItems = appCtrl.viewUser[modelName];
      }
      else{
        appCtrl.indexItems = appCtrl[modelName];
      }
      appCtrl.indexView = modelName;
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
    appCtrl.currentTab = 'index';
    appCtrl.showPostCheckButton();
    appCtrl.setIndexControls("posts")
    .then(function(indexControls){
      //indexView set by loadIndexList to 'index' or {:action} if present
      indexControls.findOrFirst("action",appCtrl.indexView)
        .then(function(control){
          if(options.force) control.force = true;
          appCtrl.loadIndexList(control);
          control.force = false;
        });
      $scope.$apply();
    });
  };
  
  this.showIndexItem = function(indexItem){
    if(typeof indexItem.title != "undefined"){
      appCtrl.showPost(indexItem)
      .then(function(post){
        index = appCtrl.indexItems.findIndex("id",post.id);
        if(index){
          post.loaded = true;
          appCtrl.indexItems[index] = post;
        }
      });
    }
    else{
      appCtrl.showComment(indexItem);
    }
  };

  this.showPostCheckButton = function(){
    setTimeout(function(){
      appCtrl.showPostCheck = true;
      $scope.$apply();
    },60000);
  };

  this.loadNextPosts = function(){
    nextStart = appCtrl.index[0].id + 1;
    
    $http.get('/posts?start_post='+nextStart)
    .success(function(data){
      if(data.length > 0){
        appCtrl.index.unshift(data);
      }
    });
    appCtrl.showPostCheck = false;
    appCtrl.showPostCheckButton();
  };

  this.loadPrevPosts = function(){
    previousStart = appCtrl.index[appCtrl.index.length-1].id - 1;
    
    $http.get('/posts?end_post='+previousStart)
    .success(function(data){
      appCtrl.index = appCtrl.index.concat(data);
      if(data.length < 5){
        appCtrl.outtaPosts = true;
      }
      appCtrl.indexItems = appCtrl.index;
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
    if(typeof appCtrl.post._id != "undefined") appCtrl.post = {};

    updateTitle("New Post");

    rootAddress = location.href.split("#")[0];
    if(!options.preserveState){
      history.pushState(
        {post:{}},
        document.title,
        rootAddress + "#/posts/new"
      );
    }
    appCtrl.currentTab = 'form';
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
          appCtrl.post = {
            title:data.title,
            content:data.content,
            _id: data._id
          };
        });
    }

    else if(typeof appCtrl.post != "undefined"
    && appCtrl.post.title != post.title){
      appCtrl.post = {
        title:post.title,
        content:post.content,
        _id: post._id
      };
    }

    rootAddress = location.href.split("#")[0];
    if(!post.preserveState){
      history.pushState(
        {post:appCtrl.post},
        document.title,
        rootAddress + "#/posts/"+post._id+"/edit"
      );
    }

    appCtrl.currentTab = 'form';
    document.getElementById("post_title").focus();

    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.exitForm = function(){
    if(location.href.indexOf("/posts/") != -1) appCtrl.currentTab = 'show';
    else appCtrl.currentTab = 'index';
  };

  this.savePost = function(){
    if(typeof appCtrl.post._id == "undefined"){
      $http.post('posts', appCtrl.post)
        .success(function(data){
          appCtrl.post = {};
          appCtrl.showIndex({force:true});
        })
        .error(function(data,status){
          appCtrl.post.errors = data.errors;
          if(status == 401) appCtrl.signOut();
        });
    }
    else{
      $http.put('/posts/'+appCtrl.post._id, appCtrl.post)
        .success(function(data){
          appCtrl.viewPost.title = appCtrl.post.title;
          appCtrl.viewPost.content = appCtrl.post.content;
          appCtrl.post = {};
          appCtrl.currentTab = 'show';
        })
        .error(function(data,status){
          appCtrl.post.errors = data.errors;
          if(status == 401) appCtrl.signOut();
        });
    }
  };

  this.loadPost = function(post){
    return new Promise(function(resolve,reject){
      //incase id submitted instead of post obj
      if(typeof post.content == "undefined" || typeof post.karma == "undefined"){
        viewPostExists = (typeof appCtrl.viewPost.id != "undefined");
        if(!viewPostExists || viewPostExists && appCtrl.viewPost._id != post){
          if(typeof post.post_id != "undefined") post = {id:post.post_id};
          if(typeof post.id == "undefined") post = {id:post};
          appCtrl.viewPost = {};

          $http.get('/posts/'+post.id)
          .success(function(data){
            appCtrl.viewPost = data;
            appCtrl.viewPost.id = data.title.convertToSlug();
            resolve(appCtrl.viewPost);
          });
        }
        else{
          resolve(appCtrl.viewPost);
        }
      }
      else{
        appCtrl.viewPost = post;
        appCtrl.viewPost.id = post.title.convertToSlug();
        resolve(post);
      }
    });
  }

  this.showPost = function(post){
    return new Promise(function(resolve,reject){
      appCtrl.loadPost(post)
      .then(function(){
        if(location.href.indexOf("posts") == -1){
          history.pushState(
            {post: appCtrl.viewPost.id},
            appCtrl.viewPost.title + " | Postr",
            location.href.split("#")[0]+"#/posts/"+appCtrl.viewPost._id + "/" + appCtrl.viewPost.title.convertToSlug()
          );
        }

        if(typeof appCtrl.viewPost.comments == "undefined"){
          //$http.get('/posts/'+appCtrl.viewPost.id+'/comments')
          $http.get('/comments/'+appCtrl.viewPost._id)
          .success(function(data){
            if(data.length > 0){
              appCtrl.viewPost.comments = data;
            }
          });
        }

        if(appCtrl.signedIn && typeof appCtrl.viewPost.postRelation == "undefined"){
          $http.get('/post_relations/'+appCtrl.viewPost._id)
          .success(function(data){
            appCtrl.viewPost.postRelation = data;
          })
          .error(function(data,status){
            if(status == 401) appCtrl.signOut();
          });
        }

        updateTitle(appCtrl.viewPost.title);
        appCtrl.viewPost.loaded = true;
        appCtrl.addingComment = false;
        appCtrl.currentTab = 'show';
        appCtrl.viewPost.commentIndex = 'created_at';
        $scope.$apply();
        resolve(appCtrl.viewPost);
      });
    });
 };
 
  this.vote = function(post){
    if(appCtrl.viewPost.postRelation.voted && confirm("Remove vote?") || !appCtrl.viewPost.postRelation.voted){
      $http.head('/posts/'+post._id+'/vote')
      .success(function(){
        appCtrl.viewPost.postRelation.voted = !appCtrl.viewPost.postRelation.voted;
        appCtrl.viewPost.karma += (appCtrl.viewPost.postRelation.voted)?1:-1;
      })
      .error(function(data, status){
        if(status == 304) alert("Post already voted on.");
        if(status == 401) appCtrl.signOut();
      });
    }
  };

  this.favorite = function(){
    $http.head('/posts/'+appCtrl.viewPost._id+'/favorite')
    .success(function(){
      appCtrl.viewPost.postRelation.favorited = !appCtrl.viewPost.postRelation.favorited;
      if(typeof appCtrl.favorites == "undefined") appCtrl.favorites = [];
      if(index = appCtrl.favorites.findIndex("id",appCtrl.viewPost.id)){
        appCtrl.favorites.splice(index,1);
      }
      else{
        appCtrl.favorites.unshift(appCtrl.viewPost);
      }
    })
    .error(function(data,status){
      if(status == 304) alert("Operation could not be performed.");
      if(status == 401) appCtrl.signOut();
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
    appCtrl.comment.post_id = appCtrl.viewPost._id;

    if(typeof appCtrl.comment._id == "undefined"){
      $http.post('/comments', appCtrl.comment)
        .success(function(data){
          if(typeof appCtrl.viewPost.comments != "undefined"){
            appCtrl.viewPost.comments.unshift(data);
          }
          else{
            appCtrl.viewPost.comments = [data];
          }
          appCtrl.viewPost.postRelation.comment_count = data.content.length;
          appCtrl.addingComment = false;
          appCtrl.comment = {};
        })
        .error(function(data, status){
          if(status == 401) appCtrl.signOut();
        });
    }
    else{
      $http.put('/comments/'+appCtrl.comment._id, appCtrl.comment)
        .success(function(comments){
          console.log(comments);
          appCtrl.viewPost.comments = comments;
          appCtrl.viewPost.postRelation.comment_count = comments.length;
          appCtrl.addingComment = false;
          appCtrl.comment = {};
        })
        .error(function(data, status){
          if(status == 401) appCtrl.signOut();
        });
    }
  };

  this.editComment = function(comment){
    appCtrl.comment = comment;
    appCtrl.addingComment = true;
    appCtrl.comment.commentView = 'post';
  };
                                                           
  this.showComment = function(comment){
    appCtrl.showPost(comment.post_id)
    .then(function(post){
      appCtrl.viewPost.featuredComment = comment;
    });
  };

  this.sortCommentsBy = function(attr){
    appCtrl.viewPost.comments.sortBy(attr);
    appCtrl.viewPost.commentIndex = attr;
  };

  this.commentVote = function(comment){
    $http.head('/comments/'+comment._id+'/vote')
    .success(function(){
      votedComments = appCtrl.viewPost.postRelation.voted_comments;
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
      if(status == 401) appCtrl.signOut();
    });
  }

//   _   _ 
//  | | | |                      
//  | | | | ___   ___  _ __  ___ 
//  | | | |/ __| / _ \| '__|/ __|
//  | |_| |\__ \|  __/| |   \__ \
//   \___/ |___/ \___||_|   |___/
//

//  this.showUserForm = function(options){
//    if(!options) options = {};
//    updateTitle("Sign Up");
//
//    appCtrl.user = {
//      name:appCtrl.session.name,
//      password:appCtrl.session.password
//    };
//
//    rootAddress = location.href.split("#")[0];
//    if(options && !options.preserveState){
//      history.pushState(
//        {user:appCtrl.user},
//        document.title,
//        rootAddress + "#/signup"
//      );
//    }
//
//    //userForm.user_name.focus();
//    appCtrl.currentTab = 'signup';
//
//    if(!$scope.$$phase){
//      $scope.$apply();
//    }
//  };

//  this.signUp = function(){
//    $http.post('/users', appCtrl.user)
//    .success(function(data){
//      console.dir(data);
//      appCtrl.currentUser = {name:data.username};
//      appCtrl.signedIn = true;
//      appCtrl.currentTab = 'index';
//    })
//    .error(function(data){
//      appCtrl.user.errors = data.errors;
//    });
//  };

//  this.passwordCheck = function(){
//    valid = (appCtrl.user.password == appCtrl.user.password_confirmation)
//    $scope.userForm.user_password_confirmation.$setValidity("passwordsMismatch",valid);
//  };

//  this.editUser = function(user){
//    if(typeof user == "undefined") user = {};
//    updateTitle("Edit Profile");
//
//    if(typeof appCtrl.viewUser.about_me == "undefined"){
//      $http.get('/users/'+user.username)
//        .success(function(data){
//          appCtrl.viewUser = data;
//          appCtrl.user = data;
//
//          appCtrl.viewUser.editingAboutMe = true;
//        });
//      appCtrl.currentTab = 'user';
//    }
//    else appCtrl.user = appCtrl.viewUser;
//
//    rootAddress = location.href.split("#")[0];
//    if(!user.preserveState){
//      history.pushState(
//        {user:appCtrl.user},
//        document.title,
//        rootAddress + "#/users/"+appCtrl.viewUser.name+"/edit"
//      );
//    }
//
//    appCtrl.viewUser.editingAboutMe = true;
//
//    if(!$scope.$$phase){
//      $scope.$apply();
//    }
//  };
//
//  this.updateAboutMe = function(){
//    $http.put('/users/'+appCtrl.currentUser.name, appCtrl.user)
//    .success(function(){
//      appCtrl.viewUser.about_me = appCtrl.user.about_me;
//      appCtrl.viewUser.editingAboutMe = false;
//    })
//    .error(function(data, status){
//      if(status == 304) alert("Changes could not be saved.");
//      if(status == 401) appCtrl.signOut();
//    });
//  };

  this.loadUser = function(userId){
    return new Promise(function(resolve, reject){
      if(!appCtrl.viewUser.id || appCtrl.viewUser.id != userId){
        $http.get('/users/'+userId)
        .success(function(data){
          appCtrl.viewUser = data;
          resolve(data);
        });
      }
      else{
        resolve(appCtrl.viewUser);
      }
    });
  };

  this.showUser = function(options){
    if(typeof options != "object") options = {userId:options};
    appCtrl.hideMenu();

    appCtrl.loadUser(options.userId)
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

      appCtrl.setIndexControls("user")
      .then(function(indexControls){
        //indexView set by loadIndexList to 'index' or {:action} if present
        indexControls.findOrFirst("action",appCtrl.indexView)
        .then(function(control){
          appCtrl.loadIndexList(control);
          appCtrl.currentTab = 'user';
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
        {user:appCtrl.user},
        document.title,
        rootAddress + "#/signin"
      );
    }

    appCtrl.currentTab = 'signin';

    //auto-fill workaround for form validation
    //appCtrl.session.name = sessionForm.session_name.value;
    //appCtrl.session.password = sessionForm.session_password.value;

    //sessionForm.session_name.focus();
    if(!$scope.$$phase){
      $scope.$apply();
    }
  };

  this.signIn = function(){
    $http.post('users/signin', appCtrl.session)
      .success(function(data){
        appCtrl.currentUser.name = document.cookie.replace(/(.*)username=/,"").replace(/;(.*)/,"");
        appCtrl.currentUser.id = appCtrl.currentUser.name;

        appCtrl.session = {};
        appCtrl.signedIn = true;
        appCtrl.showIndex();
      })
      .error(function(data,status){
        if(status == 404) appCtrl.session.errors = ["Name not found"];
        if(status == 401) appCtrl.session.errors = ["Incorrect password"];
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

    appCtrl.currentUser = {};
    appCtrl.clearout = false;
    appCtrl.signedIn = false;
    appCtrl.showSessionForm();
    //appCtrl.currentTab = 'signin';
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
    appCtrl.loadRoute();
    $scope.$apply();
  }, false);

  this.loadCurrentUser = function(){
    if(typeof appCtrl.currentUser.name == "undefined"){
      appCtrl.currentUser = {
        name:document.cookie.replace(/(.*)username=/,"").replace(/;(.*)/,"")
      };
    }
  };

  this.loadRoute = function(){
    appCtrl.clearout = false;
    appCtrl.signedIn = (document.cookie.indexOf("remember_token") != -1);

    if(appCtrl.signedIn) appCtrl.loadCurrentUser();

    urlController = location.href.split("#/")[1];

    if(typeof urlController != "undefined"){
      urlController = urlController.split("/")[0];
      urlId = location.href.split("#/")[1].split("/")[1];
      urlAction = location.href.split("#/")[1].split("/")[2];

      if(urlController == "posts"){
        if(urlId == "new") appCtrl.newPost({preserveState:true});
        else if(urlAction == "edit"){
          appCtrl.editPost({_id: urlId, preserveState:true});
        }
        else appCtrl.showPost(urlId);
      }
      else if(urlController == "users") 
        if(urlAction == "edit"){
          appCtrl.editUser({username:urlId, preserveState:true});
        }
        else appCtrl.showUser({userId:urlId,preserveState:true});
      else if(urlController == "signup")
        layout.showUserForm({preserveState:true});
      else if(urlController == "signin")
        appCtrl.showSessionForm({preserveState:true});
      else appCtrl.showIndex();
    }
    else{
      appCtrl.showIndex({preserveState:true});
    }
  };

  appCtrl.loadRoute();
}]);


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
