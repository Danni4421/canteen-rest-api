const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  },
  items: [
    {
      productId: {
        type: Number,
        required: true,
        ref: 'products',
        unique: false,
        index: false,
        min: 1,
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
