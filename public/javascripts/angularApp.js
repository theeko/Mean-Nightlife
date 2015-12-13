var app = angular.module("myApp", [ "ui.router"]);

app.config(['$stateProvider', '$urlRouterProvider', 
      function($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'mainCtrl'
            })
          .state("locationS", {
            url: "location/{loc}",
            templateUrl: "/home.html",
            controller: "mainCtrl",
            resolve: {
              search: ["$stateParams", "search", function($stateParams, search){
                return search.get($stateParams.loc);
              }]
            }
          })
          .state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ["$state", "auth", function($state, auth){
              if(auth.isLoggedIn()){
                $state.go("home");
              }
            }]
            })
            .state("login", {
              url: "/login",
              templateUrl: "/login.html",
              controller: "AuthCtrl",
              onEnter: ['$state', 'auth', function($state, auth){
              if(auth.isLoggedIn()){
                  $state.go('profile');
                }
              }]
            });
        $urlRouterProvider.otherwise('home');
      }
  ]);


app.controller("profileCtrl", ["locs","auth","$scope", function(locs, auth, $scope){
    $scope.currentUser = auth.currentUser();
    $scope.x = locs.x;
}]);

app.controller("mainCtrl", ["$scope", "auth", "locs", function($scope, auth, locs){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
    $scope.locs = locs.locs;
    $scope.get = function(loc){
      locs.get(loc);
    };
}]);

app.factory("locs", ["$http", "auth", function($http, auth){
  var x = { locs: {} };
    
    x.get = function(loc){
      $http.get("/yelp/" + loc).success(function(data){
         angular.copy(data, x.locs);
        });
    };
    
  return x;
  
}]);
  

app.factory("auth", ["$http", '$window', function($http, $window){
  var auth = {};
  
  auth.saveToken = function(token){
    $window.localStorage["mean-vote-token"] = token;
  };
  
  auth.getToken = function () {
    return $window.localStorage["mean-vote-token"];
  };
  
  auth.isLoggedIn = function(){
    var token = auth.getToken();
  
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
  
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };
  
  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
  
      return payload.username;
    }
  };
  
  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  
  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  
  auth.logOut = function(){
    $window.localStorage.removeItem('mean-vote-token');
  };
  
  return auth;
}]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};
  
    $scope.register = function(){
      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
}]);

