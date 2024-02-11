require('dotenv').config();
const Jwt = require('jsonwebtoken');
const InvariantError = require('../exceptions/client/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '30m' }),
  generateRefreshToken: (payload) => Jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '1h' }),
  verifyRefreshToken: (token) => {
    try {
      const decoded = Jwt.verify(token, process.env.REFRESH_TOKEN_KEY);

      return {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid.');
    }
  },
};

module.exports = TokenManager;
