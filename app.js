const express = require("express");
const router = new express.Router();

const app = express();

app.use(router);
router.route("/").get((req, res) => {
  res.send("ok");
});

const Room = require("./models/room");

// then GET request "/" once to create these 5 rooms.

// ... more code incoming

module.exports = app;
