const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    maxLength: 50,
    required: true,
  },
  fullname: {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
