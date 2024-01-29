const autoBind = require('auto-bind');
const NotFoundError = require('../exceptions/client/NotFoundError');

class ProductHandler {
  constructor(model, validator) {
    this._model = model;
    this._validator = validator;

    autoBind(this);
  }

  async postProductHandler(req, res, next) {
    const lastInsertedProduct = await this._model.product.findOne({}).sort({ _id: -1 }).limit(1);
    const id = lastInsertedProduct ? Number(lastInsertedProduct.id) + 1 : 1;

    try {
      await this._validator.validatePostProductPayload(req.body);
      await this._model.product.create({
        _id: id,
        ...req.body,
      });

      const insertedProduct = await this._model.product.findById(id);

      if (!insertedProduct) {
        throw new Error('Gagal menambahkan produk. Terjadi kesalahan pada server.');
      }

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menambahkan produk',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsHandler(req, res, next) {
    try {
      const products = await this._model.product.find();

      if (products.length === 0) {
        throw new NotFoundError('Gagal mendapatkan produk. Id tidak ditemukan.');
      }

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan data produk.',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductByIdHandler(req, res, next) {
    try {
      const { id: productId } = req.params;
      const product = await this._model.product.findById(productId);

      if (!product) {
        throw new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.');
      }

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan produk.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductByIdHandler(req, res, next) {
    const { id: productId } = req.params;

    try {
      await this._model.product.deleteOne({ _id: productId });

      const product = await this._model.product.findById({ _id: productId });

      if (product) {
        throw new NotFoundError('Gagal menghapus produk. Id tidak ditemukan.');
      }

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus produk.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductHandler;
