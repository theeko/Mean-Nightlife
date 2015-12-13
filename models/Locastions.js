var mongoose = require("mongoose");

var LocationSchema = new mongoose.Schema({
   name: String,
   people: String
});

mongoose.model("Location", LocationSchema);