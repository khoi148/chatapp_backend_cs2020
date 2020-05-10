require("dotenv").config({ path: ".env" });
const http = require("http");
const socketio = require("socket.io");

const app = require("./app");
const server = http.createServer(app);
const io = socketio(server);

//syntax: use 'connection' string, then specify socket strings
io.on("connection", function (socket) {
  socket.on("chat", (chatObj) => {
    let msg = chatObj.name + ": " + chatObj.text;
    console.log(msg);
    io.emit("chatlog", msg);
  });
});

// io.on("connection", function (socket) {
//   console.log("New client connected");
// });

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});
