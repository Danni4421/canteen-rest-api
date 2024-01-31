const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 255,
  },
  price: {
    type: Number,
    min: 1,
  },
  amount: {
    type: Number,
  },
  image: {
    type: [String],
    validate: {
      validator: (v) => v.every((image) => typeof image === 'string'),
      message: 'Tipe gambar harus string.',
    },
  },
});

module.exports = mongoose.model('Product', productSchema);
