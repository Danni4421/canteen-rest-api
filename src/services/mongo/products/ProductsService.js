const NotFoundError = require('../../../exceptions/client/NotFoundError');

class ProductsService {
  constructor(model) {
    this._model = model;
  }

  async addProduct({
    name, price, amount, images,
  }) {
    const lastInsertedUser = await this._model.product.findOne({}).sort({ _id: -1 }).limit(1);
    const insertedId = lastInsertedUser ? Number(lastInsertedUser._id) + 1 : 1;

    const insertedProduct = await this._model.product.create({
      _id: insertedId,
      name,
      price,
      amount,
      images,
    });

    if (!insertedProduct) {
      throw new Error('Gagal menambahkan produk, Terjadi kesalahan pada server.');
    }

    return insertedProduct;
  }

  async getProducts() {
    const products = await this._model.product.find({});
    return products;
  }

  async getProductById(productId) {
    const product = await this._model.product.findById(productId);

    if (!product) {
      throw new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.');
    }

    return product;
  }

  async updateProduct(productId, {
    name, price, amount, images,
  }) {
    const updatedProduct = await this._model.product.findOneAndReplace(
      { _id: productId },
      {
        name,
        price,
        amount,
        images,
      },
    );

    if (!updatedProduct) {
      throw new NotFoundError('Gagal memperbarui produk, Id tidak ditemukan.');
    }
  }

  async deleteProduct(productId) {
    const deletedProduct = await this._model.product.findOneAndDelete(
      {
        _id: productId,
      },
      { _id: 1 },
    );

    if (!deletedProduct) throw new NotFoundError('Gagal menghapus produk, Id tidak ditemukan.');
  }
}

module.exports = ProductsService;
