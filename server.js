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
  socket.emit("rooms", await Room.find()); //simply return an array of rooms, when app starts

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
  socket.on("joinRoom", async (roomId) => {
    //1. Server class contains a User object, in this.user, and static methods for joining rooms
    const server = await ServerClass.checkUser(socket.id);
    console.log("server: ", server);
    //2. Update database when user joins a room
    await server.joinRoom(roomId);
    //3. update the current room info to the client
    socket.emit("selectedRoom", server.user.room);
    //4 - subscribe to channel. Basically, Docs: https://socket.io/docs/rooms-and-namespaces/
    socket.join(roomId);
    //5 - send welcome message to client
    socket.emit("chatlog", {
      name: "System",
      text: `Welcome ${server.user.name} to ${server.user.room.name}`,
    });
    //6. send notifications to other clients in the new room. Must use join() first to declare arbitrary 'rooms' in socketIO
    socket.to(roomId).broadcast.emit("chatlog", {
      name: "System",
      text: `User ${server.user.name} has joined the server`,
    });
    //7 - update rooms globally to affect changes
    io.emit("rooms", await Room.find());
  });
});

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});

//login
//see all the rooms and
//join a room
