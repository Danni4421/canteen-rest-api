const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UsersService = require('../users/UsersService');
const NotFoundError = require('../../../exceptions/client/NotFoundError');
const AuthenticationError = require('../../../exceptions/client/AuthenticationError');

describe('User service test', () => {
  describe('Add user function test', () => {
    it('should throw error when document failed to insert', async () => {
      const mockInsertedUser = {
        username: 'pakkantin12',
        fisrtname: 'Yudi',
        lastname: 'Azizi',
        email: 'pakkantin@kantinjti.com',
        password: 'pakkantin12',
        role: 'admin',
      };

      const mockUserModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.addUser(mockInsertedUser))
        .rejects.toThrow(Error);
    });

    it('should return inserted user id when success insert user document', async () => {
      const mockInsertedUser = {
        username: 'pakkantin12',
        fisrtname: 'Yudi',
        lastname: 'Azizi',
        email: 'pakkantin@kantinjti.com',
        password: 'pakkantin12',
        role: 'admin',
      };

      const mockInsertedUserId = new mongoose.Types.ObjectId();

      const mockUserModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve({
          _id: mockInsertedUserId,
        })),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      const userId = await usersService.addUser(mockInsertedUser);

      expect(userId).toEqual(mockInsertedUserId);
    });
  });

  describe('Get user by id function test', () => {
    it('should throw not found error when given not found user id', async () => {
      const mockUserModel = {
        findById: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.getUserById('xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return user detail when given valid user id', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'pakkantin12',
        fullname: {
          fisrtname: 'Yudi',
          lastname: 'Azizi',
        },
        email: 'pakkantin@kantinjti.com',
        role: 'user',
      };

      const mockUserModel = {
        findById: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      const user = await usersService.getUserById(mockUser._id);

      expect(user).toStrictEqual(mockUser);
    });
  });

  describe('Update user function test', () => {
    it('should throw not found error when given not found user id', async () => {
      const mockUpdatedUser = {
        username: 'pakkantin12update',
        fullname: {
          fisrtname: 'Yudi',
          lastname: 'Azizi',
        },
        email: 'pakkantin@kantinjti.com',
        role: 'user',
      };

      const mockUserModel = {
        findOneAndUpdate: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.updateUser('xxx', mockUpdatedUser))
        .rejects.toThrow(NotFoundError);
    });

    it('should update user when given valid user id', async () => {
      const updatedUserId = new mongoose.Types.ObjectId();

      const mockUpdatedUser = {
        username: 'pakkantin12update',
        fullname: {
          fisrtname: 'Yudi',
          lastname: 'Azizi',
        },
        email: 'pakkantin@kantinjti.com',
        role: 'user',
      };

      const mockUserModel = {
        findOneAndUpdate: jest.fn().mockImplementation(() => Promise.resolve({
          _id: updatedUserId,
          ...mockUpdatedUser,
        })),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.updateUser(updatedUserId, mockUpdatedUser))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Delete user function test', () => {
    it('should throw not found error when given not found user id', async () => {
      const mockUserModel = {
        findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.deleteUser('xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should perform delete user and not throw error when given valid user id', async () => {
      const mockUserModel = {
        findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve({
          _id: new mongoose.Types.ObjectId(),
        })),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.deleteUser(1))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Verify user credential function test', () => {
    it('should throw not found error when given not found user id', async () => {
      const mockUserCredential = {
        email: 'notfoudemail@mail.com', // imagine this is not found email 😊
        password: '123123123',
      };

      const mockUserModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.verifyUserCredential(mockUserCredential))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw authentication error when password not match with expected password', async () => {
      const mockExpectedUserPassword = await bcrypt.hash('123123123', 10);
      const mockUserCredential = {
        email: 'pakkantin@kantinjti.com',
        password: 'invalidpassword', // this is invalid password
      };

      const mockUserModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve({
          password: mockExpectedUserPassword,
        })),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.verifyUserCredential(mockUserCredential))
        .rejects.toThrow(AuthenticationError);
    });

    it('should perform verify user credential correctly and return verified user', async () => {
      const mockExpectedUserPassword = await bcrypt.hash('123123123', 10);
      const mockUserCredential = {
        email: 'pakkantin@kantinjti.com',
        password: '123123123',
      };
      const mockVerifiedUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'pakkantin12update',
        fullname: {
          fisrtname: 'Yudi',
          lastname: 'Azizi',
        },
        email: 'pakkantin@kantinjti.com',
        password: mockExpectedUserPassword,
        role: 'user',
      };

      const mockUserModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(mockVerifiedUser)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      const verifiedUser = await usersService.verifyUserCredential(mockUserCredential);

      expect(verifiedUser).toStrictEqual(mockVerifiedUser);
    });
  });

  describe('Verify user is exists function test', () => {
    it('should throw error when user is not found', async () => {
      const mockUserModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.verifyUserIsExists('xxxx')).rejects.toThrow(
        new NotFoundError('Verifikasi user gagal, Id tidak ditemukan.'),
      );
    });

    it('should perform verify user is exists when given valid user id', async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockUserModel = {
        findOne: jest.fn().mockImplementation(() => Promise.resolve({
          _id: userId,
        })),
      };

      const usersService = new UsersService({
        user: mockUserModel,
      });

      await expect(usersService.verifyUserIsExists(userId)).resolves.not.toThrow(NotFoundError);
    });
  });
});
