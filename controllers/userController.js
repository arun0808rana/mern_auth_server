const Router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Register route
Router.post("/register", (req, res) => {
  const SALT_ROUNDS = 10;

  const newUser = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    hash_password: bcrypt.hashSync(req.body.password, SALT_ROUNDS),
  });

  newUser
    .save()
    .then((user) => {
      delete user.hash_password;
      console.log("User Created.");
      return res.status(201).json(user);
    })
    .catch((error) => {
      return res.status(400).send({ success: false, error });
    });
});

// Login route
Router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(async (user) => {
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          success: false,
          error: new Error("Auth failed. Invalid user/password"),
        });
      }

      await user.generateAccessToken();
      await user.generateRefreshToken();

      const cookieOptions = {
        httpOnly: true,
        expires: 0,
      };

      res.cookie("token", user.token, cookieOptions);
      res.cookie("test", "hello test", { httpOnly: false, expires: 0 });

      return res.json({
        success: true,
      });
    })
    .catch((error) => {
      return res.json({ success: false, error });
    });
});

// refresh token route
Router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: new Error("Please provide a refresh token"),
      });
    }

    const user = await User.findOne(refreshToken._id).exec();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: new Error("User not found.") });
    }

    await user.generateAccessToken();

    res.status(200).json({ success: true, ...user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

// logout route
Router.delete("/logout", async (req, res) => {});

module.exports = Router;
