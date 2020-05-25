const User = require("../models/user");
const Room = require("../models/room");

class Server {
  constructor(user) {
    this.user = user;
  }
  //const server = new Server(id, name);
  static async login(userName, socketId) {
    let user = await User.findOne({ name: userName });
    //add token to the user object, one way or another
    if (!user) {
      console.log("User not found on login. New User being created");
      user = new User({
        name: userName.toLowerCase(),
        token: socketId,
      });
    } else if (user.online === true) {
      throw new Error(
        "User is already online. Cannot login again. Pls log out first"
      );
    }

    user.token = socketId;
    user.online = true;
    console.log("user login token is: ", user.token);
    await user.save();
    return user;
  }
  static async checkUser(socketId) {
    console.log("socketId from user is: ", socketId);
    const user = await User.findOne({ token: socketId }); //registered/logged in user with the token from that socket
    //console.log("user is: ", user);
    if (!user) throw new Error("User not found: ", socketId);
    return new Server(user);
  }
  async joinRoom(roomId) {
    this.leaveRoom();
    const room = await Room.findById(roomId); //don't forget await
    if (!room.members.includes(this.user._id)) {
      room.members.push(this.user._id);
      room.save();
    }
    this.user.room = roomId; //save roomID to database
    await this.user.save();
    this.user.room = room; //however, in JS, we will use the JS object
  }

  async leaveRoom() {
    try {
      let rId = this.user.room;
      const room = await Room.findById(this.user.room); //make sure to await
      //if (!room) throw new Error("room not found");
      room.members.remove(this.user._id); //Members is a mongoose array in rooms, so remove() is a mongoose method
      await room.save(); //update the user object's room
      this.user.room = null;
      await this.user.save();
      this.user.rId = rId; //record the room they left in
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async userLogout() {
    if (this.user.room) await this.leaveRoom();
    //set user to offline in DB
    this.user.online = false;
    //remove user token
    this.user.token = null;
    await this.user.save();
    console.log(`${this.user.name} has logged out`);
  }
}
module.exports = Server;
