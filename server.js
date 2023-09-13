const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./db");
const PORT = 8998;
const PrivateRouter = require("./controllers/privateController");
const UserRouter = require("./controllers/userController");
const auth = require("./middlewares/auth");
const cors = require('cors');
const environemt = process.env.ENV;
const { exec } = require('child_process');

// middlewares
app.use(cors());
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
      const url = `http://localhost:${PORT}`;
      console.log(url);
      if(environemt === 'Development'){
        exec(`open ${url}`, (error) => {
          if (error) {
            console.error('Error opening URL:', error);
          }
        });
      }
    });
  })
  .catch((error) => {
    console.error("Error connecting mongodb", error.message);
  });
