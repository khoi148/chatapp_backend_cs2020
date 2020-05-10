const require = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    unique: true,
  },
  token: {
    type: String,
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
  },
  online: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
