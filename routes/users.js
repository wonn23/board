const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/User");

// User Profile
router.get("/profile", ensureAuthenticated, (req, res) =>
  res.render("profile", { user: req.user })
);

// Update Profile
router.post("/profile", ensureAuthenticated, (req, res) => {
  const { name, email, password } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (errors.length > 0) {
    res.render("profile", {
      errors,
      user: req.user,
    });
  } else {
    User.findOne({ _id: req.user.id }).then((user) => {
      user.name = name;
      user.email = email;

      if (password) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user.save().then((user) => {
              req.flash("success_msg", "Profile updated");
              res.redirect("/users/profile");
            });
          });
        });
      } else {
        user.save().then((user) => {
          req.flash("success_msg", "Profile updated");
          res.redirect("/users/profile");
        });
      }
    });
  }
});

// Delete User
router.post("/delete", ensureAuthenticated, (req, res) => {
  User.deleteOne({ _id: req.user.id }, (err) => {
    if (err) {
      req.flash("error_msg", "Error deleting account");
      return res.redirect("/users/profile");
    }
    req.flash("success_msg", "Account deleted");
    res.redirect("/login");
  });
});

module.exports = router;
