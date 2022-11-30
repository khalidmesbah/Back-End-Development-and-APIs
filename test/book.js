const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  pages: Number,
  rating: Number,
  genres: Array,
});

module.exports = mongoose.model("Book", bookSchema);
