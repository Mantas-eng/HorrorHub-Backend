const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
  film_name: {type:String, required: true},
  release_date:{type:String, required: true},
  age_rating: {type:String, required:true},
  age_rating_image:{type:String, required:true},
  film_image: {type:String, required:true},
  film_image_width:{type:String, required:true},
  film_image_height:{type:String, required:true},
  film_cover: {type:String, required:true},
  film_cover_width:{type:String, required:true},
  film_cover_height:{type:String, required:true},
  film_trailer: {type:String, required:true},
});

module.exports = mongoose.model("Movie", movieSchema);