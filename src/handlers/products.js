const autoBind = require('auto-bind');

class ProductsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postProductHandler(req, res, next) {
    try {
      this._validator.validatePostProductPayload(req.body);
      const insertedProduct = await this._service.productsService.addProduct(req.body);

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
    const products = await this._service.productsService.getProducts();

    return res.status(200).json({
      status: 'success',
      message: 'Berhasil mendapatkan data produk.',
      data: products,
    });
  }

  async getProductByIdHandler(req, res, next) {
    try {
      const product = await this._service.productsService.getProductById(req.params.id);

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
    try {
      this._validator.validatePutProductPayload(req.body);
      await this._service.productsService.updateProduct(req.params.id, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil memperbarui produk.',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductByIdHandler(req, res, next) {
    try {
      await this._service.productsService.deleteProduct(req.params.id);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus produk.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductsHandler;
