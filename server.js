const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./db");
const PORT = 8998;
const PrivateRouter = require("./controllers/privateController");
const UserRouter = require("./controllers/userController");
const auth = require("./middlewares/auth");

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/auth", UserRouter);
app.use("/test", auth, PrivateRouter);

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// initiating a connection to db
connectDB()
  .then((mongoRes) => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting mongodb", error.message);
  });
