const mongoose = require('mongoose');

const UserVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  uniqueString: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('UserVerification', UserVerificationSchema);
