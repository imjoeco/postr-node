POSTR.layout = angular.module("layout",[]);
 
POSTR.layout.directive("header", function(){
  return {
    restrict:'E', 
    templateUrl:'header.html',
    controller: ["$scope", function($scope){
      this.showUserForm = function(options){
        if(!options) options = {};
        updateTitle("Sign Up");

        POSTR.user = {
          name:POSTR.session.name,
          password:POSTR.session.password
        };

        rootAddress = location.href.split("#")[0];
        if(options && !options.preserveState){
          history.pushState(
            {user:POSTR.user},
            document.title,
            rootAddress + "#/signup"
          );
        }

        //userForm.user_name.focus();
        POSTR.currentTab = 'signup';

        if(!$scope.$$phase){
          $scope.$apply();
        }
      };
    }],
    controllerAs:"header"
  };
});

POSTR.layout.controller = ["$scope", function($scope){
      this.showUserForm = function(options){
        if(!options) options = {};
        updateTitle("Sign Up");

        POSTR.user = {
          name:POSTR.session.name,
          password:POSTR.session.password
        };

        rootAddress = location.href.split("#")[0];
        if(options && !options.preserveState){
          history.pushState(
            {user:POSTR.user},
            document.title,
            rootAddress + "#/signup"
          );
        }

        //userForm.user_name.focus();
        POSTR.currentTab = 'signup';

        if(!$scope.$$phase){
          $scope.$apply();
        }
      };
    }],
