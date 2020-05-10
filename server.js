require("dotenv").config({ path: ".env" });
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const app = require("./app");
const server = http.createServer(app);
const io = socketio(server);

//syntax: use 'connection' string, then specify socket strings
io.on("connection", function (socket) {
  socket.on("chat", (chatObj, cb) => {
    //console.log(chatObj); chatObj = {name:..., text:...}
    const filter = new Filter();
    if (filter.isProfane(chatObj.text)) {
      return cb("Bad words are not allowed");
    }

    io.emit("chatlog", chatObj);
  });
});

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});
