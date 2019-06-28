const User = require("./models").User;
const bcrypt = require("bcryptjs");

module.exports = {
  createUser(newUser, callback) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback) {
    return User.findOne({
      where: {
        id: id
      }
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  upgradeUser(id, callback) {
    return User.findById(id)
    .then((user) => {
      if(!user) {
        return callback("User not found");
      }
      else {
        user.update({
          role: 1
        })
        .then((user) => {
          callback(null, user);
        })
        .catch((err) => {
          callback(err);
        });
      }
    });
  },

  downgradeUser(id, callback) {
    return User.findById(id)
    .then((user) => {
      if(!user) {
        return callback("User not found");
      }
      else {
        user.update({
          role: 0
        })
        .then((user) => {
          callback(null, user);
        })
        .catch((err) => {
          callback(err);
        });
      }
    });
  }
}
