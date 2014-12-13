//var app = angular.module("index",[]);
//
//  this.setIndexControls = function(indexName){
//    return new Promise(function(resolve, reject){
//      if(indexName == "user"){
//        postCtrl.indexControls = [
//          {controller:"users", id:postCtrl.viewUser.name, action:'recent', title:'Recent'},
//          {controller:"users", id:postCtrl.viewUser.name, action:'posts', title:'Top Posts'},
//          {controller:"users", id:postCtrl.viewUser.name, action:'comments', title:'Top Comments'}
//        ];
//      }
//      else{
//        postCtrl.indexControls = [
//          {controller:'posts', action:'index', title:'Latest'},
//          {controller:'posts', action:'top', title:'Top'}
//          // todo : add trending
//        ];
//
//        if(postCtrl.signedIn){
//          postCtrl.indexControls.push({controller:'posts', action:'favorites', title:'Favorites'});
//        }
//      }
//      resolve(postCtrl.indexControls);
//    });
//  };
//                                                      
//
//  this.loadIndexList = function(options){
//    var modelName, 
//        url = '/';
//
//    if(typeof options.controller == "undefined"){
//      options.controller = 'posts';
//    }
//
//    url = url + options.controller;
//    modelName = 'index';
//
//    if(options.id){
//      url = url + '/' + options.id;
//    }
//
//    if(options.action){
//      modelName = options.action;
//      if(modelName != 'index') url = url + '/' + options.action;
//    }
//
//    if(postCtrl.indexView != modelName || options.force){
//
//      if(options.controller != "users" && (typeof postCtrl[modelName] == "undefined" || options.force)){
//        $http.get(url)
//        .success(function(data){
//          if(typeof data["items"] == "undefined"){
//            postCtrl[modelName] = data;
//            postCtrl.indexItems = data;
//          }
//          else{
//            postCtrl[modelName] = data.items;
//            postCtrl.indexItems = data.items;
//          }
//        });
//      }
//      else if(options.controller == "users" && typeof postCtrl.viewUser[modelName] == "undefined"){
//        $http.get(url)
//        .success(function(data){
//          if(typeof data["items"] == "undefined"){
//            postCtrl.viewUser[modelName] = data;
//            postCtrl.indexItems = data;
//          }
//          else{
//            postCtrl.viewUser[modelName] = data.items;
//            postCtrl.indexItems = data.items;
//          }
//        });
//      }
//      else if(options.controller == "users"){
//        postCtrl.indexItems = postCtrl.viewUser[modelName];
//      }
//      else{
//        postCtrl.indexItems = postCtrl[modelName];
//      }
//      postCtrl.indexView = modelName;
//    }
//
//    if(!$scope.$$phase){
//      $scope.$apply();
//    }
//  };
//
//  this.showIndex = function(options){
//    if(!options) options = {};
//    updateTitle();
//    rootAddress = location.href.split("#")[0];
//    if(!options.preserveState) history.pushState({controller: 'index'},document.title,'/');
//    postCtrl.currentTab = 'index';
//    postCtrl.showPostCheckButton();
//    postCtrl.setIndexControls("posts")
//    .then(function(indexControls){
//      //indexView set by loadIndexList to 'index' or {:action} if present
//      indexControls.findOrFirst("action",postCtrl.indexView)
//        .then(function(control){
//          if(options.force) control.force = true;
//          postCtrl.loadIndexList(control);
//          control.force = false;
//        });
//      $scope.$apply();
//    });
//  };
//  
//  this.showIndexItem = function(indexItem){
//    if(typeof indexItem.title != "undefined"){
//      postCtrl.showPost(indexItem)
//      .then(function(post){
//        index = postCtrl.indexItems.findIndex("id",post.id);
//        if(index){
//          post.loaded = true;
//          postCtrl.indexItems[index] = post;
//        }
//      });
//    }
//    else{
//      postCtrl.showComment(indexItem);
//    }
//  };
//
//  this.showPostCheckButton = function(){
//    setTimeout(function(){
//      postCtrl.showPostCheck = true;
//      $scope.$apply();
//    },60000);
//  };
//
//  this.loadNextPosts = function(){
//    nextStart = postCtrl.index[0].id + 1;
//    
//    $http.get('/posts?start_post='+nextStart)
//    .success(function(data){
//      if(data.length > 0){
//        postCtrl.index.unshift(data);
//      }
//    });
//    postCtrl.showPostCheck = false;
//    postCtrl.showPostCheckButton();
//  };
//
//  this.loadPrevPosts = function(){
//    previousStart = postCtrl.index[postCtrl.index.length-1].id - 1;
//    
//    $http.get('/posts?end_post='+previousStart)
//    .success(function(data){
//      postCtrl.index = postCtrl.index.concat(data);
//      if(data.length < 5){
//        postCtrl.outtaPosts = true;
//      }
//      postCtrl.indexItems = postCtrl.index;
//    });
//  };
