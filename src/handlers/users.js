const autoBind = require('auto-bind');
const mongoose = require('mongoose');
const AuthorizationError = require('../exceptions/client/AuthorizationError');
const InvariantError = require('../exceptions/client/InvariantError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUsersHandler(req, res, next) {
    try {
      this._validator.validatePostUserPayload(req.body);
      const insertedUser = await this._service.usersService.addUser(req.body);

      return res.status(201).json({
        status: 'success',
        message: 'Berhasil menambahkan user.',
        data: {
          user: insertedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdHandler(req, res, next) {
    try {
      const user = await this._service.usersService.getUserById(req.user);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan detail user.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async putUserByIdHandler(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new InvariantError('User id tidak valid.');
      }

      if (req.params.id !== req.user.id) {
        if (req.user.role !== 'admin') {
          throw new AuthorizationError('Gagal memperbarui user, Anda tidak diperbolehkan mengubah data.');
        }
      }

      this._validator.validatePutUserPayload(req.body);

      await this._service.usersService.updateUser(req.params.id, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbarui data user.',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserByIdHandler(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new InvariantError('User id tidak valid.');
      }

      if (req.params.id !== req.user.id) {
        if (req.user.role !== 'admin') {
          throw new AuthorizationError('Gagal memperbarui user, Anda tidak diperbolehkan mengubah data.');
        }
      }

      await this._service.usersService.deleteUser(req.params.id);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus user.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersHandler;
