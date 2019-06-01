const User = require("./models").User;
const Wiki = require("./models").Wiki;
const Authorizer = require("../policies/application.js");
const PremiumAuthorizer = require("../policies/privateWiki.js");

module.exports = {
  getAllWikis(callback) {
    return Wiki.findAll()
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getWiki(id, callback) {
    return Wiki.findById(id)
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },

  addWiki(newWiki, callback) {
    return Wiki.create({
      title: newWiki.title,
      body: newWiki.body,
      userId: newWiki.userId,
      private: newWiki.private
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },

  deleteWiki(req, callback) {
    return Wiki.findById(req.params.id)
    .then((wiki) => {
      let authorized;
      if (wiki.private == true) {
        authorized = new PremiumAuthorizer(req.user, wiki).destroy();
      }
      else {
        authorized = new Authorizer(req.user, wiki).destroy();
      }

      if(authorized) {
        wiki.destroy()
        .then((res) => {
          callback(null, wiki);
        });
      }
      else {
        req.flash("notice", "You must create an account to do that.");
        callback(401);
      }
    })
    .catch((err) => {
      callback(err);
    })
  },

  updateWiki(req, updatedWiki, callback) {
    return Wiki.findById(req.params.id)
    .then((wiki) => {
      if(!wiki) {
        return callback("Wiki not found");
      }
      const authorized = new Authorizer(req.user, wiki).update();

      if(authorized) {
        wiki.update(updatedWiki, {
          fields: Object.keys(updatedWiki)
        })
        .then(() => {
          callback(null, wiki);
        })
        .catch((err) => {
          callback(err);
        });
      }
      else {
        req.flash("notice", "You must create an account to do that.");
        callback("Forbidden");
      }
    });
  },

  makeAllWikisPublic(userId, callback) {
    return Wiki.findAll({
      where: {
        userId: userId
      }
    })
    .then((wikis) => {
      wikis.forEach(wiki => {
        wiki.update({
          private: false
        })
      })
    })
    .catch((err) => {
      callback(err);
    });
  }
}
