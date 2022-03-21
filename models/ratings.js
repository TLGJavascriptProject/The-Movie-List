const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rating = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  movie_id: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ratings", rating);
