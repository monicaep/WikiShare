const Collaborator = require("./models").Collaborator;
const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Authorizer = require("../policies/collaborator");

module.exports = {
  createCollaborator(newCollaborator, callback) {
    Collaborator.findOne({
      where: {
        username: newCollaborator.username
      }
    })
    .then((collaborator) => {
      if(collaborator) {
        return callback("This user is already a collaborator.");
      }
      else {
        return Collaborator.create(newCollaborator)
        .then((collaborator) => {
          callback(null, collaborator);
        })
        .catch((err) => {
          console.log(err);
          callback(err);
        })
      }
    })
  },

  deleteCollaborator(id, callback) {
    return Collaborator.destroy({
      where: { id: id }
    })
    .then(() => {
      callback(null);
    })
    .catch((err) => {
      callback(err);
    })
  }
}
