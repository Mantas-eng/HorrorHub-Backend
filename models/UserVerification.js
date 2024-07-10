const mongoose = require('mongoose');

const UserVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  uniqueString: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  expiredAt: { type: Date, required: true },
});

module.exports = mongoose.model('UserVerification', UserVerificationSchema);