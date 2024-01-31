const autoBind = require('auto-bind');
const mongoose = require('mongoose');
const NotFoundError = require('../exceptions/client/NotFoundError');
const InvariantError = require('../exceptions/client/InvariantError');

class ProductHandler {
  constructor(model, validator) {
    this._model = model;
    this._validator = validator;

    autoBind(this);
  }

  async postProductHandler(req, res, next) {
    try {
      this._validator.validatePostProductPayload(req.body);
      const insertedProduct = await this._model.product.create({
        ...req.body,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menambahkan produk',
        data: {
          id: insertedProduct._id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsHandler(req, res) {
    const products = await this._model.product.find();

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mendapatkan data produk.',
      data: products,
    });
  }

  async getProductByIdHandler(req, res, next) {
    const { id: productId } = req.params;

    try {
      if (!mongoose.isValidObjectId(productId)) throw new InvariantError('Id tidak valid.');

      const product = await this._model.product.findById(productId);

      if (!product) throw new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.');

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan produk.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async putProductByIdHandler(req, res, next) {
    const { id: productId } = req.params;

    try {
      if (!mongoose.isValidObjectId(productId)) throw new InvariantError('Id tidak valid.');

      this._validator.validatePutProductPayload(req.body);
      const updatedProduct = await this._model.product.findOneAndReplace(
        { _id: productId },
        { ...req.body }
      );

      if (!updatedProduct) throw new NotFoundError('Gagal memperbarui produk, Id tidak ditemukan.');

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbarui produk.',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductByIdHandler(req, res, next) {
    const { id: productId } = req.params;

    try {
      if (!mongoose.isValidObjectId(productId)) throw new InvariantError('Id tidak valid.');

      const deletedProduct = await this._model.product.findOneAndDelete(
        {
          _id: productId,
        },
        { _id: 1 }
      );

      if (!deletedProduct) throw new NotFoundError('Gagal menghapus produk, Id tidak ditemukan.');

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
