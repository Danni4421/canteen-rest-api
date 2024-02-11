const InvariantError = require('../../../exceptions/client/InvariantError');
const AuthenticationsService = require('../authentications/AuthenticationsService');

describe('Authentication service test', () => {
  describe('Add authentication function test', () => {
    it('should throw error when insert document failed', async () => {
      const insertedRefreshToken = {
        userId: 'object id',
        token: 'valid refresh token', // let say this is jwt token 😁
      };

      const mockAuthenticationModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve(null)),
        // resolve null mean nothing being inserted
      };

      const authenticationsService = new AuthenticationsService({
        authentication: mockAuthenticationModel,
      });

      await expect(authenticationsService.addAuthentication(insertedRefreshToken))
        .rejects.toThrow(Error);
    });

    it('should perform add authentication function correctly', async () => {
      const insertedRefreshToken = {
        userId: 'object id',
        token: 'valid refresh token', // hehe imagine this is jwt token
      };

      const mockAuthenticationModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve({
          _id: 'object id',
          ...insertedRefreshToken,
        })),
      };

      const authenticationsService = new AuthenticationsService({
        authentication: mockAuthenticationModel,
      });

      expect(authenticationsService.addAuthentication(insertedRefreshToken))
        .resolves.not.toThrow(Error);
    });
  });

  describe('Verify refresh token function test', () => {
    it('should throw error when given invalid refresh token', async () => {
      const mockRefreshToken = 'unresolve refresh token'; // invalid refresh token

      const mockAuthenticationModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const authenticationsService = new AuthenticationsService({
        authentication: mockAuthenticationModel,
      });

      await expect(authenticationsService.verifyRefreshToken(mockRefreshToken))
        .rejects.toThrow(InvariantError);
    });

    it('should not throw error when given valid refresh token', async () => {
      const mockRefreshToken = 'resolved refresh token'; // invalid refresh token

      const mockAuthenticationModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve({
          _id: 'object id',
          userId: 'object id',
          token: 'refresh token',
        })),
      };

      const authenticationsService = new AuthenticationsService({
        authentication: mockAuthenticationModel,
      });

      await expect(authenticationsService.verifyRefreshToken(mockRefreshToken))
        .resolves.not.toThrow(InvariantError);
    });
  });

  describe('Delete refresh token function test', () => {
    it('should perform delete refresh token correctly', async () => {
      const mockRefreshToken = 'invalid refresh token';

      const mockAuthenticationModel = {
        findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve({
          _id: 'object id',
          userId: 'object id',
          token: 'refresh token',
        })),
      };

      const authenticationsService = new AuthenticationsService({
        authentication: mockAuthenticationModel,
      });

      await expect(authenticationsService.deleteAuthentication(mockRefreshToken))
        .resolves.not.toThrow(Error);
    });
  });
});
