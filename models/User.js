const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  limit: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);