const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    unique: true,
    toLowerCase: true,
  },
  token: {
    type: String,
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
  },
});

module.exports = mongoose.model("User", userSchema);
