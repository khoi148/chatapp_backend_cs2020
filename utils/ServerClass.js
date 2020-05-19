const User = require("../models/user");
const Room = require("../models/room");

class Server {
  constructor(user) {
    this.user = user;
  }
  //const server = new Server(id, name);
  static async login(userName, socketId) {
    let user = await User.findOne({ name: userName.toLowerCase() });
    //add token to the user object, one way or another
    if (!user) {
      user = await User.create({
        name: userName.toLowerCase(),
        token: socketId,
      });
    }
    user.token = socketId;
    await user.save();
    return user;
  }
  static async checkUser(socketId) {
    const user = await User.findOne({ token: socketId }); //registered/logged in user with the token from that socket
    console.log("user is: ", user);
    if (!user) throw new Error("User not found: ", socketId);
    return new Server(user);
  }
  async joinRoom(roomId) {
    const room = await Room.findById(roomId);
    if (!room.members.includes(this.user._id)) {
      room.members.push(this.user._id);
    }
    console.log("room data", room);
    this.user.room = roomId; //save roomID to database
    await this.user.save();
    this.user.room = room; //however, in JS, we will use the JS object
  }
}
module.exports = Server;
