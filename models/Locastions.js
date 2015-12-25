var mongoose = require("mongoose");

var LocationSchema = new mongoose.Schema({
   people: [String],
   name: String,
   img_r_url: String,
   url: String,
   img_url: String,
   rating: Number,
   adress: String,
   desc: String
});

LocationSchema.methods.addToPeople = function(user,cb){
   this.people.push(user);
   this.save(cb);
};

mongoose.model("Location", LocationSchema);