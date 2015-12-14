var mongoose = require("mongoose");

var LocationSchema = new mongoose.Schema({
   people: [String],
   name: String,
   img_r_url: String,
   url: String,
   img_url: String,
   rating: Number,
   desc: String
});

mongoose.model("Location", LocationSchema);