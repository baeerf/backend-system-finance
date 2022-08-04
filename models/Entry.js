const mongoose = require("mongoose");

const Entry = mongoose.model("Entry", {
  idUser: String,
  title: String,
  value: Number,
  category: String,
  date: { type: String, default: new Date() },
});

module.exports = Entry;
