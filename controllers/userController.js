const Router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");

// Register route
Router.post("/register", (req, res) => {
  const SALT_ROUNDS = 10;

  const newUser = new User({
    email: req.body.email,
    hash_password: bcrypt.hashSync(req.body.password, SALT_ROUNDS),
  });

  newUser
    .save()
    .then((user) => {
      console.log("User Created.");
      return res
        .status(201)
        .json({ success: true, msg: "User Created successfully." });
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
      const refreshToken = await RefreshToken.createToken(user);

      const cookieOptions = {
        httpOnly: true,
        expires: new Date(
          Date.now() +
            Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRATION_TIME)
        ),
      };

      res.cookie("token", user.token, cookieOptions);

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: new Date(
          Date.now() +
            Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRATION_TIME)
        ),
      });

      return res.json({
        success: true,
        refreshToken,
      });
    })
    .catch((error) => {
      return res.json({ success: false, error, fn: "Login Router" });
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

    const user = await User.findOne(refreshToken.user);

    const userRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!userRefreshToken) {
      return res
        .status(401)
        .json({ success: false, error: new Error("Refresh token not found.") });
    }

    // console.log("Refresh token found from user.");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: new Error("User not found.") });
    }

    // console.log("User found.");

    const isRefreshTokenValid = await RefreshToken.verifyExpiration(
      userRefreshToken.token
    );

    if (!isRefreshTokenValid) {
      return res.status(403).json({
        success: false,
        error: new Error("Token expired, login again."),
      });
    }

    // console.log("Not expired yet.");

    await user.generateAccessToken();

    // console.log("access token revoked");

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(
        Date.now() + Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRATION_TIME)
      ),
    };

    res.cookie("token", user.token, cookieOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

// logout route
Router.delete("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: new Error("Please provide refresh token for logging out."),
      });
    }

    await RefreshToken.findOneAndRemove({ token: refreshToken });
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(204).json({ success: false });
  }
});

module.exports = Router;
