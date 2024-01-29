require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/products');
const ClientError = require('./exceptions/client/ClientError');

const app = express();
const port = process.env.PORT || 9000;

mongoose.connect('mongodb://127.0.0.1:27017/kantin').catch(() => {
  app.response({
    status: 'error',
    message: 'Database Error',
  });
});

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    if (err instanceof ClientError) {
      return res.status(err.statusCode).json({
        status: 'fail',
        type: 'client error',
        message: err.message,
      });
    }
  }

  return res.status(500).json({
    status: 'fail',
    message: 'Terjadi kesalahan pada server',
  });
});

app.listen(port, () => {
  console.info(`Server run on port ${port}`);
});
