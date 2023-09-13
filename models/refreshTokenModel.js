const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
  expireAt: {
    type: Date,
    default: Date.now() + 1 * 60 * 1000   // expires in 10 minutes
  },
});

RefreshTokenSchema.statics.createToken = async function (user) {
  const payload = { id: user._id };
  const _token = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  });

  const newRefreshToken = new this({
    token: _token,
    user: user._id,
  });

  const refreshToken = await newRefreshToken.save();
  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_KEY, function (err, decoded) {
      if (err) {
        /*
        err = {
          name: 'TokenExpiredError',
          message: 'jwt expired',
          expiredAt: 1408621000
        }
      */

        console.log("verification error", err);
        reject(err);
      }
      resolve(decoded);
    });
  });
};

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
