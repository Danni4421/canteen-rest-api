const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
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
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['process', 'done', 'decline'],
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    require: true,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
