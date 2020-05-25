const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    toLowerCase: true,
    unique: true,
  },
  token: {
    type: String,
    unique: true,
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
  },
  online: {
    type: Boolean,
    required: [true, "User's online status must indicate true or false"],
  },
});

module.exports = mongoose.model("User", userSchema);
