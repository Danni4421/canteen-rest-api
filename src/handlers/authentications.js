const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(service, validator, tokenManager) {
    this._service = service;
    this._validator = validator;
    this._tokenManager = tokenManager;

    autoBind(this);
  }

  async postAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePostAuthenticationPayload(req.body);
      const user = await this._service.usersService.verifyUserCredential(req.body);

      const accessToken = this._tokenManager.generateAccessToken({
        id: user._id, role: user.role,
      });
      const refreshToken = this._tokenManager.generateRefreshToken({
        id: user._id, role: user.role,
      });

      await this._service.authenticationsService.addAuthentication(user._id, refreshToken);

      return res.status(201).json({
        status: 'success',
        message: 'Berhasil melakukan autentikasi.',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAuthenticationHandler(req, res, next) {
    try {
      this._validator.validatePutAuthenticationPayload(req.body);
      await this._service.authenticationsService.verifyRefreshToken(req.body.refreshToken);

      const user = this._tokenManager.verifyRefreshToken(req.body.refreshToken);
      const accessToken = this._tokenManager.generateAccessToken(user);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbarui token.',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthenticationHandler(req, res, next) {
    try {
      this._validator.validateDeleteAuthenticationPayload(req.body);

      this._tokenManager.verifyRefreshToken(req.body.refreshToken);
      await this._service.authenticationsService.deleteAuthentication(req.body.refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus token.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthenticationsHandler;
