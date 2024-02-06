const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: {
    type: Number,
  },
  name: {
    type: String,
    minLength: 1,
    maxLength: 100,
  },
  price: {
    type: Number,
    min: 1,
  },
  amount: {
    type: Number,
  },
  images: {
    type: [String],
    validate: {
      validator: (v) => v.every((image) => typeof image === 'string'),
      message: 'Tipe gambar harus string.',
    },
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = mongoose.model('Product', productSchema);
