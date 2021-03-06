const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/application.js");
const PrivateAuthorizer = require("../policies/privateWiki.js");
const markdown = require("markdown").markdown;

module.exports = {
  index(req, res, next) {
    const authorized = new Authorizer(req.user).show();

    wikiQueries.getAllWikis((err, wikis) => {
      if(err) {
        res.redirect(500, "static/index");
      }
      else {
        if (authorized) {
          res.render("wikis/index", {wikis});
        }
      }
    })
  },

  new(req, res, next) {
    const authorized = new Authorizer(req.user).new();

    if(authorized) {
      res.render("wikis/new")
    }
    else {
      req.flash("notice", "You must create an account to do that.");
      res.redirect("/wikis");
    }
  },

  create(req, res, next) {
    const authorized = new Authorizer(req.user).create();

    if(authorized) {
      let newWiki = {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private: req.body.private
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if(err) {
          console.log(err);
          res.redirect(500, "/wikis/new");
        }
        else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    }
    else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  show(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null) {
        res.redirect(404, "/");
      }
      else {
        wiki.body = markdown.toHTML(wiki.body);
        res.render("wikis/show", {wiki});
      }
    });
  },

  update(req, res, next) {
    wikiQueries.updateWiki(req, req.body, (err, wiki) => {
      if(err || wiki == null) {
        res.redirect(401, `/wikis/${req.params.id}/edit`);
      }
      else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },

  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null) {
        res.redirect(404, "/");
      }
      else {
        let authorized;
        if (req.body.private == true) {
          authorized = new PrivateAuthorizer(req.user, wiki).edit();
        }
        else {
          authorized = new Authorizer(req.user, wiki).edit();
        }

        if(authorized) {
          res.render("wikis/edit", {wiki});
        }
        else {
          req.flash("notice", "You are not authorized to do that.");
          res.redirect("`/wikis/${req.params.id}`")
        }
      }
    });
  },

  destroy(req, res, next) {
    wikiQueries.deleteWiki(req, (err, wiki) => {
      if(err) {
        console.log(err);
        res.redirect(err, `/wikis/${req.params.id}`)
      }
      else {
        res.redirect(303, "/wikis")
      }
    });
  }
}
