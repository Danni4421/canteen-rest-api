const InvariantError = require('../../exceptions/client/InvariantError');
const UserValidator = require('../users');

describe('User Validator test', () => {
  describe('Post user payload validation test', () => {
    it('should throw error when not contain needed property', () => {
      const mockPostUserPayload = {
        username: 'pakkantin12',
        lastname: 'Ahmadi',
        email: 'pakkantin@kantinjti.com',
      };

      try {
        UserValidator.validatePostUserPayload(mockPostUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"firstname" is required');
      }
    });

    it('should throw error when given bad payload value', () => {
      const mockPostUserPayload = {
        username: 'pakkantin12',
        firstname: 'Ahmad',
        email: 'pakkantin@kantinjti.com',
        password: 123213,
        role: null,
      };

      try {
        UserValidator.validatePostUserPayload(mockPostUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"password" must be a string');
      }
    });

    it('should not throw error when given needed attribute and valid value', () => {
      const mockPostUserPayload = {
        username: 'pakkantin12',
        firstname: 'Ahmad',
        lastname: 'Ahmadi',
        email: 'pakkantin@kantinjti.com',
        password: '12345678',
        role: 'admin',
      };

      expect(UserValidator.validatePostUserPayload(mockPostUserPayload)).toBeUndefined();
    });
  });

  describe('Put user payload validation test', () => {
    it('should throw error when given bad payload value', () => {
      const mockPutUserPayload = {
        username: null,
        firstname: 'Ahmad',
        lastname: 'Ahmadi',
        email: 'invalid-email',
      };

      try {
        UserValidator.validatePutUserPayload(mockPutUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"username" must be a string');
      }
    });

    it('should not throw error when given valid payload', () => {
      const mockPutUserPayload = {
        username: 'pakkantin11',
        firstname: 'Ahmad',
        lastname: 'Ahmadi',
        email: 'pakkantin@kantinjti.com',
      };

      expect(UserValidator.validatePutUserPayload(mockPutUserPayload)).toBeUndefined();
    });
  });

  describe('Put user password payload test', () => {
    it('should throw error when not contain needed property', () => {
      const mockPutUserPasswordPayload = {};

      try {
        UserValidator.validatePutUserPasswordPayload(mockPutUserPasswordPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"password" is required');
      }
    });

    it('should throw error when given bad payload value', () => {
      const mockPutUserPasswordPayload = {
        password: 12345678,
      };

      try {
        UserValidator.validatePutUserPasswordPayload(mockPutUserPasswordPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"password" must be a string');
      }
    });

    it('should not throw error when contain needed property and valid payload value', () => {
      const mockPutUserPasswordPayload = {
        password: 'pakkantin123',
      };

      expect(UserValidator.validatePutUserPasswordPayload(mockPutUserPasswordPayload))
        .toBeUndefined();
    });
  });
});
