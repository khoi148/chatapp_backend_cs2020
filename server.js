require("dotenv").config({ path: ".env" });
const http = require("http");
const socketio = require("socket.io");

const app = require("./app");

const server = http.createServer(app);

const io = socketio(server);

let count = 0;
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("increment", () => {
    ++count;
    io.emit("countUpdated", count);
    //special note. Broadcast emits to all OTHER clients. So use normal emit to include original client
    //socket.broadcast.emit("countUpdated", count);
  });
  socket.broadcast.emit("countUpdated", count);
});

// io.on("connection", function (socket) {
//   console.log("New client connected");
// });

server.listen(process.env.PORT, () => {
  console.log("server listening on port " + process.env.PORT);
});
