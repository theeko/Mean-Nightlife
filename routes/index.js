var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var User = mongoose.model('User');
var express = require('express');
var jwt = require('express-jwt');
var passport = require('passport');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var yelp = require("../yelpmodule/yelp.js");
var yelpApi = new yelp();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password);

    user.save(function (err){
        if(err){ return next(err); }

        return res.json({token: user.generateJWT()});
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }
    
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
    
        if(user){
          return res.json({token: user.generateJWT()});
        } else {
          return res.status(401).json(info);
        }
    })(req, res, next);
});

router.post("/api", function(req, res, next) {
  var location = new Location(req.body);
  // location.people = req.body.username;
  // location.img_r_url = req.body.img_r_url;
  // location.img_url = req.body.img_url;
  // location.rating = req.body.rating;
  // location.url = req.body.url;
  // location.desc = req.body.desc;
  // location.name = req.body.name.toLowerCase();
  console.log(location);
  Location.find({name: req.body.name}, function(err,found){
    if(err){ return next(err); }
    if(found){ 
      // if(found.people.indexOf(req.body.username) == -1){
      //   found.people.push(req.body.username);
      // }
    }else {
      location.save(function (err,result) {
        if(err){ return console.log(err); }
        res.json(result);
      });
    }
  });
  
});

router.get("/locations", function(req, res, next) {
    Location.find(function (err,locs) {
      if(err){ return next(err); }
      res.json(locs);   
    });
});


router.get("/yelp/:location", function(req, res) {
    yelpApi.request_yelp( req.params.location, function(error, response, body){
      if(error){  console.log(error); return; }
      // var yelpData = JSON.parse(body).businesses;
      // location = new Location();
      // yelpData.forEach(function(data){
      //   Location.find({ name: data.name }, function(err, loc){
      //     if(!!loc){
      //       location.name = data.name;
      //       location.url = data.url;
      //       location.image_url = data.image_url;
      //       location.descr = data.snippet_text;
      //       location.rating_img_url = data.rating_image_url
      //     }
          
      //   })
      // })
      // yelp -> name url image_url snippet_text rating_image_url
      Location.find({})
      res.json(JSON.parse(body));
    });
});

module.exports = router;