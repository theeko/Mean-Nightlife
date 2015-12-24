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
  
  Location.find({name: req.body.name}, function(err,found){
    console.log(found.name);
    if(err){ return next(err); }
    
    if (found.name){ 
      if(found.people.indexOf(req.body.username) == -1)
        found.people.push(req.body.username);
        found.save();
    }else {
      var location = new Location(req.body);
      location.save(function (err,result) {
        if(err){ return console.log(err); }
        res.json(result);
      });
    }
  }
  );
});

router.get("/locations", function(req, res, next) {
    Location.find(function (err,locs) {
      if(err){ return next(err); }
      res.json(locs);   
    });
});

router.get("/userlocs/:username", function(req, res, next) {
    Location.find({people: req.params.username},function (err,locs) {
      if(err){ return next(err); }
      res.json(locs);  
    });
});


router.get("/yelp/:location", function(req, res) {
    yelpApi.request_yelp( req.params.location, function(error, response, body){
      if(error){  console.log(error); return; }
      res.json(JSON.parse(body));
    });
});

router.delete("/locs/:locname/:username", function (req,res,next) {
  Location.find({name: req.params.locname}, function(err, found) {
    found.forEach(function (elem, index) {
    if(err){ next(err); }
      var ind = elem.people.indexOf(req.params.username);
      elem.people.splice(ind,1);
      if(elem.people.length == 0){
        elem.remove(function(err, loc){
          if(err){ return next(err) }
          res.json(loc);
      })}
    });
    });
});

module.exports = router;