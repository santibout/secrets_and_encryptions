//jshint esversion:6
// place dotenv at the top
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/usersDB", {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;
console.log(process.env.ME);

userSchema.plugin(encrypt, { secret, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    console.log("login: ", req.body);
    const { username, password } = req.body;
    User.findOne({ email: username }, (err, user) => {
      if (!err) {
        if (user) {
          if (user.password === password) {
            console.log(user);
            res.render("secrets");
          } else {
            res.send({ error: "user name and password do not match" });
          }
        } else {
          console.log(err);
          res.send({ error: "unable to find user" });
        }
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    console.log("req.body: ", req.body);
    const user = new User({
      email: req.body.username,
      password: req.body.password,
    });
    user.save(function (err) {
      if (err) console.error(err);
      else res.render("secrets");
    });
  });

app.listen(5000, () => {
  console.log("running server");
});
