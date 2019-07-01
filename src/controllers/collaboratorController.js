const collaboratorQueries = require("../db/queries.collaborators.js");

module.exports = {
  create(req, res, next) {
    let newCollaborator = {
      username: req.body.username,
      userId: req.user.id,
      wikiId: req.params.wikiId
    };
    collaboratorQueries.createCollaborator(newCollaborator, (err, collaborator) => {
      if(err) {
        req.flash("error", err);
        req.flash("notice", "There was an error processing your request.");
      }
      else {
          req.flash("notice", "Collaborator added.");
          res.redirect(req.headers.referer);
      }
    });
  },

  destroy(req, res, next) {
    collaboratorQueries.deleteCollaborator(req.params.id, (err, collaborator) => {
      if(err) {
        req.flash("error", err);
      }
      else {
        res.redirect(`/wikis/${req.params.wikiId}`);
      }
    });
  }
}
