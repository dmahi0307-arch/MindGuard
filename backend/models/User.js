const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  expoPushToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
