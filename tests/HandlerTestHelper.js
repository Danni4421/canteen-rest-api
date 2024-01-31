const mongoose = require('mongoose');

function generateObjectId() {
  return new mongoose.Types.ObjectId().toString();
}

module.exports = {
  generateObjectId,
};
