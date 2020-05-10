const require = require("mongoose");

const roomSchema = new mongoose.Schema({
  room: String,
  members: [
    {
      type: mongoose.Schema.ObjectId,
      unique: true,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Room", roomSchema);
