//jshint esversion:6
"use strict";

import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import express from "express";
import _ from "lodash";

import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const MONGO_URL = "mongodb://127.0.0.1:27017";
const DATABASE_NAME = "userDB";

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", false);
mongoose.connect(`${MONGO_URL}/${DATABASE_NAME}`);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// GET Methods
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/secrets", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("secrets");
});
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return console.log(err);
    res.redirect("/");
  });
});

// POST Methods
app.post("/register", async (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function (err, account) {
      if (err) return res.render("register", { account: account });
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  );
});

app.post("/login", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (!err)
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    else console.log(err);
  });
});

// Start server
app.listen(process.env.PORT || 3000, function () {
  console.log("Server Running!");
});
