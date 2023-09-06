const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  hash_password: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});


UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.hash_password);
};

UserSchema.methods.generateAccessToken = function(){
  const user = this;
  const payload = { email: user.email, fullName: user.fullName, _id: user._id };
  user.token = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: "30s",
  });
}

UserSchema.methods.generateRefreshToken = function(){
  const user = this;
  const payload = { email: user.email, fullName: user.fullName, _id: user._id };
  user.refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, {
    expiresIn: "1m",
  });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;