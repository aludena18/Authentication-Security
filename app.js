//jshint esversion:6
"use strict";

import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import express from "express";
import _ from "lodash";

const MONGO_URL = "mongodb://127.0.0.1:27017";
const DATABASE_NAME = "userDB";

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect(`${MONGO_URL}/${DATABASE_NAME}`);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// const secretKey = "thisismysecretkey";
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = mongoose.model("User", userSchema);

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

// POST Methods
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({
    email: username,
    password: password,
  });
  try {
    await newUser.save();
    console.log("User Registered!");
    res.render("secrets");
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const erroMsg = "User or password wrong!";
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      email: username,
    });
    if (!user) throw new Error(erroMsg);
    if (user.password === password) res.render("secrets");
    else throw new Error(erroMsg);
  } catch (error) {
    console.log(error.message);
  }
});

// Start server
app.listen(process.env.PORT || 3000, function () {
  console.log("Server Running!");
});
