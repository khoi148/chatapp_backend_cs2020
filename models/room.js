const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: String,
  //NOTE: do not declare unique:true. Mongoose will think even NULL member arrays conflict. As a null members array is itself unique
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Room", roomSchema);
