const InvariantError = require('../../../exceptions/client/InvariantError');

class AuthenticationsService {
  constructor(model) {
    this._model = model;
  }

  async addAuthentication(userId, token) {
    const insertedRefreshToken = await this._model.authentication.create({
      userId, token,
    });

    if (!insertedRefreshToken) {
      throw new Error('Gagal menyimpan token, Terjadi kesalahan pada server.');
    }
  }

  async verifyRefreshToken(token) {
    const refreshToken = await this._model.authentication.findOne({
      token,
    });

    if (!refreshToken) {
      throw new InvariantError('Refresh token tidak valid.');
    }
  }

  async deleteAuthentication(token) {
    await this._model.authentication.findOneAndDelete({
      token,
    });
  }
}

module.exports = AuthenticationsService;
