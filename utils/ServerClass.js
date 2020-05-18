const User = require("../models/user");
class Server {
  constructor() {}

  //const server = new Server(id, name);
  static async login(userName, socketId) {
    let user = await User.findOne({ name: userName.toLowerCase() });
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
}
module.exports = Server;
