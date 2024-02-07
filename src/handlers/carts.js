const autoBind = require('auto-bind');

class CartsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCartHandler(req, res, next) {
    try {
      this._validator.validatePostCartPayload(req.body);

      const verifiedItems = await this._service.cartsService.verifyCartItems(req.body.items);
      await this._service.cartsService.addCart(req.user.id, verifiedItems);

      return res.status(201).json({
        status: 'success',
        message: 'Berhasil menambahkan keranjang belanja.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCartHandler(req, res, next) {
    try {
      const cart = await this._service.cartsService.getCart(req.user.id);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan keranjang belanja.',
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putCartHandler(req, res, next) {
    try {
      this._validator.validatePutCartPayload(req.body);

      const verifiedItems = await this._service.cartsService.verifyCartItems(req.body.items);
      await this._service.cartsService.updateCart(req.user.id, verifiedItems);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbarui keranjang belanja.',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCartHandler(req, res, next) {
    try {
      await this._service.cartsService.deleteCart(req.user.id);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus keranjang belanja.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartsHandler;
