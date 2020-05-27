const Room = require("./models/room");
const ServerClass = require("./utils/ServerClass.js");
const Filter = require("bad-words");

module.exports = function (io) {
  //syntax: use 'connection' string, then specify socket strings
  io.on("connection", async (socket) => {
    socket.emit("rooms", await Room.find()); //simply return an array of rooms, when app starts

    socket.on("chat", async (chatObj, cb) => {
      const server = await ServerClass.checkUser(socket.id);
      //console.log(chatObj); chatObj = {name:..., text:...}
      const filter = new Filter();
      if (filter.isProfane(chatObj.text))
        return cb("Bad words are not allowed");
      try {
        io.to(server.user.room._id).emit("chatlog", chatObj);
      } catch (err) {
        console.log(err.message);
      }
    });

    socket.on("login", async (userName, cb) => {
      try {
        //need a function to check if username exists in DB, user Model, to return user. Otherwise login creates a new one
        const user = await ServerClass.login(userName, socket.id); // user is {name: xxx, token: xxx}
        return cb({ ok: true, data: user });
      } catch (err) {
        console.log("login error: ", err.message);
        return cb({ ok: false, error: err.message });
      }
    });

    socket.on("joinRoom", async (roomId) => {
      //1. Server class contains a User object, in this.user, and static methods for joining rooms
      const server = await ServerClass.checkUser(socket.id);
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
        createdAt: new Date().getTime(),
      });
      //6. send notifications to other clients in the new room. Must use join() first to declare arbitrary 'rooms' in socketIO
      socket.to(roomId).broadcast.emit("chatlog", {
        name: "System",
        text: `User ${server.user.name} has joined the server`,
      });
      //7 - update rooms globally to affect changes
      io.emit("rooms", await Room.find());
    });

    socket.on("leaveRoom", async (_, cb) => {
      // "_" basically a filler input, no use
      try {
        const server = await ServerClass.checkUser(socket.id);
        //Update client & database when user leaves a room
        socket.emit("selectedRoom", null); //note: user.room is a JS object.
        await server.leaveRoom(); //server.user.rId is a field we create to keep track of the room we left
        //notify other clients in that room that user left
        socket.to(server.user.rId).emit("chatlog", {
          name: "System",
          text: `${server.user.name} has left the room.`,
        });
        socket.leave(server.user.rId); //unsubscribe from the channel
        io.emit("rooms", await Room.find()); //update rooms globally
        return cb({ ok: true, data: server.user });
      } catch (err) {
        return cb({ ok: false, error: err.message });
      }
    });

    //event "disconnect" automaticall gets called, when client closes app
    socket.on("disconnect", async () => {
      try {
        const server = await ServerClass.checkUser(socket.id);
        await server.userLogout(); //remove user from Room and stuff
        io.emit("rooms", await Room.find({}));
      } catch (err) {
        console.log(err.message);
      }
    });
  });
};
