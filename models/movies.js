const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movie = new Schema({
  movie_id: {
    type: String,
    required: true,
  },
  release_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("movies", movie);
