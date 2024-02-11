const InvariantError = require('../../exceptions/client/InvariantError');
const AuthenticationValidator = require('../authentications');

describe('Authentication Validator test', () => {
  describe('Post authentication payload test', () => {
    it('should throw error when not contain needed property', () => {
      const mockPostAuthenticationPayload = {
        password: '123123213',
      };

      try {
        AuthenticationValidator.validatePostAuthenticationPayload(mockPostAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"email" is required');
      }
    });

    it('should throw error when given bad payload value', () => {
      const mockPostAuthenticationPayload = {
        email: null,
        password: undefined,
      };

      try {
        AuthenticationValidator.validatePostAuthenticationPayload(mockPostAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"email" must be a string');
      }
    });

    it('should not throw error when given needed property and valid value', () => {
      const mockPostAuthenticationPayload = {
        email: 'pakkantin@kantinjti.com',
        password: '123213123',
      };

      expect(AuthenticationValidator
        .validatePostAuthenticationPayload(mockPostAuthenticationPayload))
        .toBeUndefined();
    });
  });

  describe('Put authentication payload test', () => {
    it('should throw error when not contain needed property', () => {
      const mockPutAuthenticationPayload = {};

      try {
        AuthenticationValidator.validatePutAuthenticationPayload(mockPutAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"refreshToken" is required');
      }
    });

    it('should throw error when given bad payload value', () => {
      const mockPutAuthenticationPayload = {
        refreshToken: 123,
      };

      try {
        AuthenticationValidator.validatePutAuthenticationPayload(mockPutAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"refreshToken" must be a string');
      }
    });

    it('should not throw error when contain needed property and valid value', () => {
      const mockPutAuthenticationPayload = {
        refreshToken: 'valid refresh token', // let's just say this is valid jwt token 😁
      };

      expect(AuthenticationValidator
        .validatePutAuthenticationPayload(mockPutAuthenticationPayload))
        .toBeUndefined();
    });
  });

  describe('Delete authentication payload test', () => {
    it('should throw error when not given needed property', () => {
      const mockDeleteAuthenticationPayload = {};

      try {
        AuthenticationValidator
          .validateDeleteAuthenticationPayload(mockDeleteAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"refreshToken" is required');
      }
    });

    it('should throw error when given bad payload value', () => {
      const mockDeleteAuthenticationPayload = {
        refreshToken: null,
      };

      try {
        AuthenticationValidator
          .validateDeleteAuthenticationPayload(mockDeleteAuthenticationPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"refreshToken" must be a string');
      }
    });

    it('should not throw error when given needed property and valid value', () => {
      const mockDeleteAuthenticationPayload = {
        refreshToken: 'valid refresh token', // let's just say again this is valid jwt token 😁
      };

      expect(AuthenticationValidator
        .validateDeleteAuthenticationPayload(mockDeleteAuthenticationPayload))
        .toBeUndefined();
    });
  });
});
