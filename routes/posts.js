const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const Post = require("../models/Post");

// Get All Posts
router.get("/", ensureAuthenticated, (req, res) => {
  Post.find({ user: req.user.id })
    .sort({ date: -1 })
    .then((posts) => res.render("dashboard", { posts }));
});

// Create Post
router.post("/add", ensureAuthenticated, (req, res) => {
  const { title, body } = req.body;
  let errors = [];

  if (!title || !body) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (errors.length > 0) {
    res.render("dashboard", {
      errors,
      title,
      body,
    });
  } else {
    const newPost = new Post({
      title,
      body,
      user: req.user.id,
    });
    newPost.save().then((post) => {
      req.flash("success_msg", "Post created");
      res.redirect("/posts");
    });
  }
});

// Edit Post
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) =>
    res.render("post", { post })
  );
});

// Update Post
router.post("/edit/:id", ensureAuthenticated, (req, res) => {
  Post.findOneAndUpdate(
    { _id: req.params.id },
    { title: req.body.title, body: req.body.body },
    { new: true },
    (err, post) => {
      if (err) {
        req.flash("error_msg", "Error updating post");
        return res.redirect("/posts");
      }
      req.flash("success_msg", "Post updated");
      res.redirect("/posts");
    }
  );
});

// Delete Post
router.get("/delete/:id", ensureAuthenticated, (req, res) => {
  Post.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      req.flash("error_msg", "Error deleting post");
      return res.redirect("/posts");
    }
    req.flash("success_msg", "Post deleted");
    res.redirect("/posts");
  });
});

module.exports = router;
