require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const PassportJwt = require('passport-jwt');
const cors = require('cors');

/** Routes */
const userRoutes = require('./routes/users');
const authenticationRoutes = require('./routes/authentications');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');

/** Custom Error */
const ClientError = require('./exceptions/client/ClientError');

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

const dbUrl = process.env.DB_CONNECTION || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'kantin';

mongoose.connect(`${dbUrl}/${dbName}`).catch(() => {
  app.status(500).json({
    status: 'error',
    message: 'Database Error',
  });
});

app.use(passport.initialize());
passport.use(
  new PassportJwt.Strategy(
    {
      jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken({
        fail: (response) => {
          console.log(response);
        },
      }),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
      algorithms: ['HS256'],
    },
    (jwtPayload, done) => {
      if (!jwtPayload.id) {
        return done(new Error('Invalid Payload'), false);
      }

      return done(null, {
        id: jwtPayload.id,
        role: jwtPayload.role,
      });
    },
  ),
);

app.use('/authentications', authenticationRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(err);

  if (err instanceof Error) {
    console.log(err);

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
