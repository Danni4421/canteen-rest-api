const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true,
    unique: true,
  },
  items: [
    {
      _id: false,
      productId: {
        type: Number,
        required: true,
        index: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 1,
      },
      subtotal: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);
