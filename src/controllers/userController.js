const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const stripe = require('stripe')(process.env.stripe_secret);


module.exports = {
  signUp(req, res, next) {
    res.render("users/sign_up");
  },

  create(req, res, next) {
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err) {
        console.log(err);
        req.flash("error", err);
        res.redirect("/users/sign_up");
      }
      else {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: req.body.email,
          from: 'mep823@gmail.com',
          subject: 'Thanks for signing up for Blocipedia',
          text: 'Hope you enjoy',
          html: '<strong>Wiki Time!</strong>',
        };
        sgMail.send(msg);

        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");
          res.redirect("/");
        });
      }
    });
  },

  show(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user == null) {
        res.redirect(404, "/");
      }
      else {
        res.render("users/show", {user})
      }
    });
  },

  signInForm(req, res, next) {
    res.render("users/sign_in");
  },

  signIn(req, res, next) {
    passport.authenticate("local")(req, res, function () {
      if(!req.user) {
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("/users/sign_in");
      }
      else {
        req.flash("notice", "You've successfully signed in.");
        res.redirect("/");
      }
    });
  },

  signOut(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully signed out.");
    res.redirect("/");
  },

  upgradeForm(req, res, next) {
    res.render("users/upgradeForm");
  },

  /*upgrade(req, res, next) {
    console.log(5);
    const token = req.body.stripeToken;

    const charge = stripe.charges.create({
      amount: 1500,
      currency: 'usd',
      description: 'Premium Membership',
      source: token
    })
    .then((charge) => {
      console.log(4);
      userQueries.upgradeUser(req.params.id, (err, user) => {
        if (err || user == null) {
          console.log(3);
          req.flash("notice", "Upgrade unsuccessful. Please try again.");
          res.redirect(400, `/users/upgrade`);
        }
        else {
          console.log(err);
          console.log(2);
          req.flash("notice", "You've successfully upgraded to Premium!");
          console.log(req.params);
          console.log(1);
          res.redirect("users/upgradeSuccess");
          console.log(0);
        }
      })
    })
  },*/
  /*upgrade(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user == null) {
        res.redirect(404, "/");
      }
      else {
        res.render("users/upgradeSuccess");
      }
    });
  },*/

  upgrade(req, res, next) {
    const token = req.body.stripeToken;
    const charge = stripe.charges.create({
      amount: parseInt(process.env.stripe_cost, 10),
      currency: process.env.stripe_ccy,
      source: token,
      description: "Premium Membership",
    });
    userQueries.upgradeUser(req.params.id, (err, user) => {
      if(err || user == null) {
        req.flash("notice", "Upgrade unsuccessful. Please try again.");
        res.redirect("/users/upgradeForm");
      }
      else {
        req.flash("notice", "You've successfully upgraded to Premium!");
        res.render("users/upgradeSuccess");
      }
    });
  },

  upgradeSuccess(req, res, next) {
    res.render("users/upgradeSuccess");
  },

  downgradeForm(req, res, next) {
    res.render("users/downgradeForm");
  },

  downgrade(req, res, next) {
    userQueries.downgradeUser(req.params.id, (err, user) => {
      if (err || user == null) {
        req.flash("notice", "Downgrade unsuccessful. Please try again.");
        res.redirect(400, `/users/downgradeForm`);
      }
      else {
        req.flash("notice", "You've successfully downgraded to Standard.");
        res.render("users/downgradeSuccess");
      }
    })
  },
  /*downgrade(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
      if(err || user == null) {
        res.redirect(404, "/");
      }
      else {
        res.render("users/downgradeSuccess");
      }
    });
  },*/

  downgradeSuccess(req, res, next) {
    res.render("users/downgradeSuccess");
  }
}
