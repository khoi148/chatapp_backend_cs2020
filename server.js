require("dotenv").config({ path: ".env" });
const http = require("http");
const socketio = require("socket.io");

//use app.js
const app = require("./app");
const server = http.createServer(app);
const io = socketio(server);
const mongoose = require("mongoose");

mongoose.connect(process.env.DB, {
  // some options to deal with deprecated warning, you don't have to worry about them.
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
require("./io")(io);

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});

//login
//see all the rooms and
//join a room
