const mongoose = require('mongoose');
const InvariantError = require('../../exceptions/client/InvariantError');
const NotFoundError = require('../../exceptions/client/NotFoundError');
const UsersHandler = require('../users');
const AuthorizationError = require('../../exceptions/client/AuthorizationError');

describe('Users handler test', () => {
  describe('Post user handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        username: null,
        email: 'pakkantin@kantinjti.com',
      };

      const mockUserValidator = {
        validatePostUserPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"username" must be a string');
          }),
      };

      const mockRequest = {
        body: mockBadPayload,
      };
      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, mockUserValidator);
      await usersHandler.postUsersHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('"username" must be a string'),
      );
    });

    it('should throw error when fail to insert document', async () => {
      const mockUserPayload = {
        username: 'pakkantin12',
        firstname: 'Yudi',
        lastname: 'Setiadi',
        email: 'pakkantin@kantinjti.com',
        password: 'pakkantin123',
        role: 'admin',
      };

      const mockUserValidator = {
        validatePostUserPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        addUser: jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Gagal menambahkan user');
          }),
      };

      const mockRequest = {
        body: mockUserPayload,
      };
      const mockNext = jest.fn();

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, mockUserValidator);
      await usersHandler.postUsersHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new Error('Gagal menambahkan user'),
      );
    });

    it('should perform post user handler function correctly', async () => {
      const mockUserPayload = {
        username: 'pakkantin12',
        firstname: 'Yudi',
        lastname: 'Setiadi',
        email: 'pakkantin@kantinjti.com',
        password: 'pakkantin123',
        role: 'admin',
      };

      const mockUserValidator = {
        validatePostUserPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        addUser: jest
          .fn()
          .mockImplementation(() => Promise.resolve('inserted user id')), // let say this is inserted user id
      };

      const mockRequest = {
        body: mockUserPayload,
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);
      const mockNext = jest.fn();

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, mockUserValidator);
      await usersHandler.postUsersHandler(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menambahkan user.',
        data: {
          user: 'inserted user id',
        },
      });
    });
  });

  describe('Get user by id handler function test', () => {
    it('should throw error when user not found', async () => {
      const mockRequest = {
        params: {
          id: 'xxx', // let say this is not found id,
        },
      };

      const mockNext = jest.fn();

      const mockUsersService = {
        getUserById: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('User tidak ditemukan.');
          }),
      };

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, null);

      await usersHandler.getUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new NotFoundError('User tidak ditemukan.'));
    });

    it('should return user when given valid id', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        username: 'pakkantin12',
        fullname: {
          firstname: 'Yudi',
          lastname: 'Azizi',
        },
        email: 'pakkantin@kantinjti.com',
        role: 'admin',
      };

      const mockRequest = {
        params: {
          id: userId, // let say this is not found id,
        },
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);
      const mockNext = jest.fn();

      const mockUsersService = {
        getUserById: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockUser)),
      };

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, null);

      await usersHandler.getUserByIdHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil mendapatkan detail user.',
        data: mockUser,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Put user handler function test', () => {
    it('should throw error when given invalid id', async () => {
      const invalidId = 'xxx'; // this is invalid id

      const mockRequest = {
        params: {
          id: invalidId,
        },
      };

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, null);
      await usersHandler.putUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('User id tidak valid.'));
    });

    it('should throw error when user is not the owner', async () => {
      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: new mongoose.Types.ObjectId(),
        },
        user: {
          id: validObjectId,
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, null);
      await usersHandler.putUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext)
        .toHaveBeenCalledWith(new AuthorizationError('Gagal memperbarui user, Anda tidak diperbolehkan mengubah data.'));
    });

    it('should throw error when bad payload', async () => {
      const badUserUpdatePayload = {
        username: 'pakkantin12',
        /**
         * validation error cz required properties not found
         */
      };

      const mockUserValidator = {
        validatePutUserPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"firstname" is required');
          }),
      };

      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: validObjectId,
        },
        user: {
          id: validObjectId,
          role: 'user',
        },
        body: badUserUpdatePayload,
      };

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, mockUserValidator);
      await usersHandler.putUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('"firstname" is required'),
      );
    });

    it('should perform put user handler function correctly', async () => {
      const badUserUpdatePayload = {
        username: 'pakkantin12',
        firstname: 'Yudi',
        lastname: 'Yuliadi',
        email: 'pakkantin@kantinjti.com',
      };

      const mockUserValidator = {
        validatePutUserPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockUsersService = {
        updateUser: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: new mongoose.Types.ObjectId(),
        },
        user: {
          id: validObjectId,
          role: 'admin',
        },
        body: badUserUpdatePayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, mockUserValidator);
      await usersHandler.putUserByIdHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil memperbarui data user.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Delete user by id handler function test', () => {
    it('should throw error when given invalid id', async () => {
      const invalidId = 'xxx'; // this is invalid id

      const mockRequest = {
        params: {
          id: invalidId,
        },
      };

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, null);
      await usersHandler.deleteUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('User id tidak valid.'));
    });

    it('should throw error when user is not the owner', async () => {
      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: new mongoose.Types.ObjectId(),
        },
        user: {
          id: validObjectId,
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const usersHandler = new UsersHandler(null, null);
      await usersHandler.deleteUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext)
        .toHaveBeenCalledWith(new AuthorizationError('Gagal memperbarui user, Anda tidak diperbolehkan mengubah data.'));
    });

    it('should not throw error when user is valid', async () => {
      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: validObjectId,
        },
        user: {
          id: validObjectId,
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const mockUsersService = {
        deleteUser: jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Gagal menghapus user'); // to test if user valid but delete user service error
          }),
      };

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, null);
      await usersHandler.deleteUserByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Gagal menghapus user'));
    });

    it('should perform delete user handler function correctly', async () => {
      const validObjectId = new mongoose.Types.ObjectId();

      const mockRequest = {
        params: {
          id: new mongoose.Types.ObjectId(),
        },
        user: {
          id: validObjectId,
          role: 'admin',
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockUsersService = {
        deleteUser: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const usersHandler = new UsersHandler({
        usersService: mockUsersService,
      }, null);
      await usersHandler.deleteUserByIdHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus user.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
