const mongoose = require('mongoose');

const authenticationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model('Authentication', authenticationSchema);
