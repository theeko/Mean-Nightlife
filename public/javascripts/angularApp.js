var app = angular.module("myApp", [ "ui.router"]);

app.config(['$stateProvider', '$urlRouterProvider', 
      function($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'mainCtrl',
            onEnter: ["locs", function(locs){
              locs.x = {};
            }]
            })
          .state('locations', {
            url: '/locations',
            templateUrl: '/locations.html',
            controller: 'locationsCtrl',
            // onEnter: ["$state", "auth", function ($state, auth) {
            //     if(!auth.isLoggedIn){ $state.go("home"); }
            //   }],
            resolve: {
                locas: ["locs", function(locs){
                  return locs.getLocs();
                }]
              }
            })
          .state('profile', {
            url: '/profile',
            templateUrl: '/profile.html',
            controller: 'profileCtrl',
            resolve: {
                locas: ["locs", function(locs){
                  return locs.userlocs(currentUser);
                }]
              }
            })
          // .state("locationS", {
          //   url: "location/{loc}",
          //   templateUrl: "/home.html",
          //   controller: "mainCtrl",
          //   resolve: {
          //     search: ["$stateParams", "search", function($stateParams, search){
          //       return search.get($stateParams.loc);
          //     }]
          //   }
          // })
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


app.controller("profileCtrl", ["locs","auth","$scope","locas", function(locs, auth, $scope, locas){
    $scope.currentUser = auth.currentUser();
    $scope.locas = locas;
}]);

app.controller("locationsCtrl", ["locs","auth","$scope","locas", function(locs, auth, $scope, locas){
    $scope.currentUser = auth.currentUser();
    $scope.locs = locs.locs;
    $scope.locas = locas;
}]);

app.controller("mainCtrl", ["$scope", "auth", "locs", function($scope, auth, locs){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
    $scope.locs = locs.locs;
    $scope.get = function(search){
      locs.get(search);
      $scope.search = "";
    };
    
    $scope.addLocation = function(info){
      
        
      var data = {
        img_r_url: info.rating_img_url_small,
        url: info.url,
        img_url: info.image_url,
        name: info.name,
        rating: info.rating,
        desc: info.snippet_text,
        adress: info.location.address[0],
        people: [auth.currentUser()]
      };
      locs.addLoc(data);
    };
    
}]);

app.factory("locs", ["$http", "auth", function($http, auth){
  var x = { locs: {} };
    
    x.get = function(loc){
      $http.get("/yelp/" + loc).success(function(data){
         angular.copy(data, x.locs);
        });
    };
    
    x.addLoc = function(data){
      $http.post('/api', data, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(bd){
        console.log("bd received")
         window.location.href = "#profile";
      });
    };
    
    x.getLocs = function () {
      return $http.get("/locations").success(function (data) {
        return data;
      });
    };
    
    x.userLocs = function (username) {
      $http.get("/userlocs/" + username).success(function (data) {
        return data;
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

