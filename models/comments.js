const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comment = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  movie_id: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
  comment: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("comments", comment);
