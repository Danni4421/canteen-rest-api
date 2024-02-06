const mongoose = require('mongoose');
const AuthenticationsHandler = require('../authentications');
const InvariantError = require('../../exceptions/client/InvariantError');
const AuthenticationError = require('../../exceptions/client/AuthenticationError');

describe('Authentication handler test', () => {
  describe('Post authentication handler function test', () => {
    it('should throw error when given bad payload value', async () => {
      const mockBadAuthPayload = {
        email: null, // email must be a string
        // password: null, # password is required
      };

      const mockAuthValidator = {
        validatePostAuthenticationPayload: jest.fn().mockImplementation(() => {
          throw new InvariantError('"email" must be a string');
        }),
      };

      const mockRequest = {
        body: mockBadAuthPayload,
      };
      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler(null, mockAuthValidator, null);

      await authenticationsHandler.postAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"email" must be a string'));
    });

    it('should throw authentication error when given invalid user credential', async () => {
      const mockInvalidUserCredential = {
        email: 'validemail@mail.com',
        password: 'invalidpassword', // this is cause an authentication error
      };

      const mockAuthValidator = {
        validatePostAuthenticationPayload: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        verifyUserCredential: jest.fn().mockImplementation(() => {
          throw new AuthenticationError('Gagal melakukan autentikasi, Kredensial tidak valid.');
        }),
      };

      const mockRequest = {
        body: mockInvalidUserCredential,
      };
      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler(
        {
          usersService: mockUsersService,
        },
        mockAuthValidator,
        null,
      );

      await authenticationsHandler.postAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AuthenticationError('Gagal melakukan autentikasi, Kredensial tidak valid.'),
      );
    });

    it('should throw error when fail to insert document', async () => {
      const mockInvalidUserCredential = {
        email: 'validemail@mail.com',
        password: 'validpassword',
      };

      const mockUserId = new mongoose.Types.ObjectId();

      const mockRequest = {
        user: {
          _id: mockUserId,
          role: 'user',
        },
        body: mockInvalidUserCredential,
      };
      const mockNext = jest.fn();

      const mockAuthValidator = {
        validatePostAuthenticationPayload: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        verifyUserCredential: jest.fn().mockImplementation(() => Promise.resolve({
          _id: mockUserId,
          role: 'user',
        })),
      };

      const mockAuthenticationsService = {
        addAuthentication: jest.fn().mockImplementation(() => {
          throw new Error('Gagal menyimpan token, Terjadi kesalahan pada server.');
        }),
      };

      const mockTokenManager = {
        generateAccessToken: jest.fn().mockImplementation(() => Promise.resolve('this is access token')),
        generateRefreshToken: jest.fn().mockImplementation(() => Promise.resolve('this is refresh token')),
      };

      const authenticationsHandler = new AuthenticationsHandler(
        {
          usersService: mockUsersService,
          authenticationsService: mockAuthenticationsService,
        },
        mockAuthValidator,
        mockTokenManager,
      );

      await authenticationsHandler.postAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new Error('Gagal menyimpan token, Terjadi kesalahan pada server.'),
      );
    });

    it('should perform post authentication function correctly', async () => {
      const mockInvalidUserCredential = {
        email: 'validemail@mail.com',
        password: 'validpassword',
      };

      const mockUserId = new mongoose.Types.ObjectId();

      const mockRequest = {
        user: {
          _id: mockUserId,
          role: 'user',
        },
        body: mockInvalidUserCredential,
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);
      const mockNext = jest.fn();

      const mockAuthValidator = {
        validatePostAuthenticationPayload: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        verifyUserCredential: jest.fn().mockImplementation(() => Promise.resolve({
          _id: mockUserId,
          role: 'user',
        })),
      };

      const mockAuthenticationsService = {
        addAuthentication: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const mockTokenManager = {
        generateAccessToken: jest.fn().mockImplementation(() => 'this is access token'),
        generateRefreshToken: jest.fn().mockImplementation(() => 'this is refresh token'),
      };

      const authenticationsHandler = new AuthenticationsHandler(
        {
          usersService: mockUsersService,
          authenticationsService: mockAuthenticationsService,
        },
        mockAuthValidator,
        mockTokenManager,
      );

      await authenticationsHandler.postAuthenticationHandler(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil melakukan autentikasi.',
        data: {
          accessToken: 'this is access token',
          refreshToken: 'this is refresh token',
        },
      });
    });
  });

  describe('Put authentication handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        refreshToken: null, // it should be a valid jwt token
      };

      const mockAuthValidator = {
        validatePutAuthenticationPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"refreshToken" must be a string');
          }),
      };

      const mockRequest = {
        body: mockBadPayload,
      };
      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler(null, mockAuthValidator, null);

      await authenticationsHandler.putAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"refreshToken" must be a string'));
    });

    it('should throw error when given invalid refresh token', async () => {
      const mockInvalidPayload = {
        refreshToken: 'invalid refresh token', // not found document
      };

      const mockAuthValidator = {
        validatePutAuthenticationPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockAuthService = {
        verifyRefreshToken: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('Refresh token tidak valid.');
          }),
      };

      const mockRequest = {
        body: mockInvalidPayload,
      };
      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler({
        authenticationsService: mockAuthService,
      }, mockAuthValidator, null);

      await authenticationsHandler.putAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('Refresh token tidak valid.'));
    });

    it('should perform put authentication correctly', async () => {
      const mockValidPayload = {
        refreshToken: 'valid refresh token', // let say this is valid refresh token 😊
      };

      const mockAuthValidator = {
        validatePutAuthenticationPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockAuthService = {
        verifyRefreshToken: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockTokenManager = {
        generateAccessToken: jest
          .fn()
          .mockImplementation(() => 'new access token'),
        verifyRefreshToken: jest.fn(),
      };

      const mockRequest = {
        body: mockValidPayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };

      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler({
        authenticationsService: mockAuthService,
      }, mockAuthValidator, mockTokenManager);

      await authenticationsHandler.putAuthenticationHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil memperbarui token.',
        data: {
          accessToken: 'new access token',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Delete authentication handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        refreshToken: null, // it should be a valid jwt token
      };

      const mockAuthValidator = {
        validateDeleteAuthenticationPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"refreshToken" must be a string');
          }),
      };

      const mockRequest = {
        body: mockBadPayload,
      };
      const mockNext = jest.fn();

      const authenticationsHandler = new AuthenticationsHandler(null, mockAuthValidator, null);

      await authenticationsHandler.deleteAuthenticationHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"refreshToken" must be a string'));
    });

    it('should perform delete authentication correctly', async () => {
      const mockValidPayload = {
        refreshToken: 'valid refresh token', // let say this is valid refresh token 😊
      };

      const mockAuthValidator = {
        validateDeleteAuthenticationPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        body: mockValidPayload,
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);
      const mockNext = jest.fn();

      const mockAuthService = {
        deleteAuthentication: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockTokenManager = {
        verifyRefreshToken: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const authenticationsHandler = new AuthenticationsHandler({
        authenticationsService: mockAuthService,
      }, mockAuthValidator, mockTokenManager);

      await authenticationsHandler.deleteAuthenticationHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus token.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
