const bcrypt = require('bcrypt');
const NotFoundError = require('../../../exceptions/client/NotFoundError');
const AuthenticationError = require('../../../exceptions/client/AuthenticationError');

class UsersService {
  constructor(model) {
    this._model = model;
  }

  async addUser({
    username, firstname, lastname, email, password, role,
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedUser = await this._model.user.create({
      username,
      fullname: {
        firstname,
        lastname,
      },
      email,
      password: hashedPassword,
      role,
    });

    if (!insertedUser) {
      throw new Error('Gagal menambahkan user');
    }

    return insertedUser._id;
  }

  async getUserById(user) {
    const findedUser = await this._model.user.findById(
      {
        _id: user.id,
      },
      {
        _id: 1,
        username: 1,
        fullname: 1,
        email: 1,
        role: 1,
      },
    );

    if (!findedUser) {
      throw new NotFoundError('User tidak ditemukan.');
    }

    return findedUser;
  }

  async updateUser(userId, {
    username, firstname, lastname, email,
  }) {
    const updatedUser = await this._model.user.findOneAndUpdate({
      _id: userId,
    }, {
      username, firstname, lastname, email,
    });

    if (!updatedUser) {
      throw new NotFoundError('Gagal memperbarui user, terjadi kesalahan pada server.');
    }
  }

  async deleteUser(userId) {
    const deletedUser = await this._model.user.findOneAndDelete({
      _id: userId,
    }, {
      _id: 1,
    });

    if (!deletedUser) {
      throw new NotFoundError('Gagal menghapus user, Id tidak ditemukan.');
    }
  }

  async verifyUserCredential({ email, password }) {
    const user = await this._model.user.findOne({
      email,
    });

    if (!user) {
      throw new NotFoundError('Gagal melakukan autentikasi, User tidak ditemukan.');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new AuthenticationError('Gagal melakukan autentikasi, Kredensial tidak valid.');
    }

    return user;
  }

  async verifyUserIsExists(userId) {
    const user = await this._model.user.findOne({
      _id: userId,
    }, {
      _id: 1,
    });

    if (!user) {
      throw new NotFoundError('Verifikasi user gagal, Id tidak ditemukan.');
    }
  }
}

module.exports = UsersService;
