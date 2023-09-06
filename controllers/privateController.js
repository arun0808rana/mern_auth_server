const Router = require("express").Router();
const Private = require("../models/privateModel");

// private route
Router.get("/private", (req, res) => {
  return res.status(200).json({ success: true, data: {msg: "This data is decoded from jwt token", user: req.user} });
});

module.exports = Router;
