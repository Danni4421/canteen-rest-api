const InvariantError = require('../../../exceptions/client/InvariantError');
const NotFoundError = require('../../../exceptions/client/NotFoundError');

class CartsService {
  constructor(model) {
    this._model = model;
  }

  async addCart(userId, items) {
    const insertedCart = await this._model.cart.create({
      userId,
      items,
    });

    if (!insertedCart) {
      throw new Error('Gagal menambahkan keranjang belanja.');
    }
  }

  async getCart(userId) {
    const cart = await this._model.cart.findOne({
      userId,
    });

    if (!cart) {
      throw new NotFoundError('User tidak memiliki keranjang belanja.');
    }

    return cart;
  }

  async updateCart(userId, items) {
    const updatedCart = await this._model.cart.findOneAndUpdate({
      userId,
    }, {
      items,
    }, {
      new: true,
    });

    if (!updatedCart) {
      throw new NotFoundError('Gagal memperbarui keranjang belanja. User tidak memiliki keranjang.');
    }
  }

  async deleteCart(userId) {
    const deletedCart = await this._model.cart.findOneAndDelete({
      userId,
    });

    if (!deletedCart) {
      throw new NotFoundError('Gagal menghapus keranjang belanja. User tidak memiliki keranjang.');
    }
  }

  async verifyCartItems(items) {
    const foundedProduct = await this._model.product.find({
      _id: {
        $in: items.map((item) => item.productId),
      },
    });

    const verifiedProduct = items.map((item) => {
      const product = foundedProduct.find((prod) => prod._id === item.productId);

      if (!product) {
        throw new InvariantError('Verifikasi item gagal, Produk tidak valid.');
      }

      if (item.amount > product.amount) {
        throw new InvariantError('Verifikasi item gagal, Jumlah produk tidak cukup.');
      }

      return {
        ...item,
        subtotal: item.amount * product.price,
      };
    });

    return verifiedProduct;
  }
}

module.exports = CartsService;
