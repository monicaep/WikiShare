const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const stripe = require('stripe')(process.env.stripeKey);


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
    res.render("users/upgrade");
  },

  upgrade(req, res, next) {
    const token = req.body.stripeToken;

    const charge = stripe.charges.create({
      amount: 1500,
      currency: 'usd',
      description: 'Premium Membership',
      source: token
    })
    .then((charge) => {
      userQueries.upgradeUser(req.params.id, (err, user) => {
        if (err || user == null) {
          res.flash("notice", "Upgrade unsuccessful. Please try again.");
          res.redirect(400, `/users/upgrade`);
        }
        else {
          res.flash("notice", "You've successfully upgraded to Premium!");
          res.redirect("users/upgradeSuccess");
        }
      })
    })
  },

  upgradeSuccess(req, res, next) {
    res.render("users/upgradeSuccess");
  },

  downgradeForm(req, res, next) {
    res.render("users/downgrade");
  },

  downgrade(req, res, next) {
    userQueries.downgradeUser(req.params.id, (err, user) => {
      if (err || user == null) {
        console.log(err);
        res.flash("notice", "Downgrade unsuccessful. Please try again.");
        res.redirect(400, `/users/downgrade`);
      }
      else {
        res.flash("notice", "You've successfully downgraded to Standard.");
        res.redirect("users/downgradeSuccess");
      }
    })
  },

  downgradeSuccess(req, res, next) {
    res.render("users/downgradeSuccess");
  }
}
