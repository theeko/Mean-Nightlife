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