require('dotenv').config();
const Jwt = require('jsonwebtoken');
const TokenManager = require('../TokenManager');
const InvariantError = require('../../exceptions/client/InvariantError');

describe('Token manager json web token test', () => {
  it('should return generated json web token to be an access token', () => {
    const userPayload = {
      id: '123',
      role: 'admin',
    };

    const accessToken = TokenManager.generateAccessToken(userPayload);

    expect(typeof accessToken).toEqual('string');
  });

  it('should return generated json web token to be an refresh token', () => {
    const userPayload = {
      id: '123',
      role: 'admin',
    };

    const refreshToken = TokenManager.generateRefreshToken(userPayload);

    expect(typeof refreshToken).toEqual('string');
  });

  describe('Verify refresh token function test', () => {
    it('should throw error when given invalid jwt token', () => {
      const expiredJwtToken = Jwt.sign({ id: '123', role: 'user' }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: -1, // make the token expire 😁
      });

      try {
        TokenManager.verifyRefreshToken(expiredJwtToken);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
      }
    });

    it('should verify generated access token and return decoded payload', () => {
      const userPayload = {
        id: '123',
        role: 'admin',
      };

      const refreshToken = TokenManager.generateRefreshToken(userPayload);
      const decodedToken = TokenManager.verifyRefreshToken(refreshToken);

      expect(decodedToken).not.toBeUndefined();
      expect(decodedToken).toStrictEqual(userPayload);
    });
  });
});
