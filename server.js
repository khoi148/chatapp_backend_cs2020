require("dotenv").config({ path: ".env" });
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
//use app.js
const app = require("./app");
const server = http.createServer(app);
const mongoose = require("mongoose");
const io = socketio(server);
const Room = require("./models/room");
const ServerClass = require("./utils/ServerClass.js");

mongoose.connect(process.env.DB, {
  // some options to deal with deprecated warning, you don't have to worry about them.
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//syntax: use 'connection' string, then specify socket strings
io.on("connection", async (socket) => {
  socket.emit("rooms", await Room.find()); //simply return an array of rooms

  socket.on("chat", (chatObj, cb) => {
    //console.log(chatObj); chatObj = {name:..., text:...}
    const filter = new Filter();
    if (filter.isProfane(chatObj.text)) {
      return cb("Bad words are not allowed");
    }
    io.emit("chatlog", chatObj); //io means this event triggers for ALL listeners
  });
  socket.on("login", async (userName, cb) => {
    try {
      //need a function to check if username exists in DB, user Model, to return user. Otherwise login creates a new one
      const user = await ServerClass.login(userName, socket.id); // user is {name: xxx, token: xxx}
      return cb({ ok: true, data: user });
    } catch (err) {
      return cb({ ok: false, error: err.message });
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});

//login
//see all the rooms and
//join a room
