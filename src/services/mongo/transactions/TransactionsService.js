const InvariantError = require('../../../exceptions/client/InvariantError');
const NotFoundError = require('../../../exceptions/client/NotFoundError');

class TransactionsService {
  constructor(model) {
    this._model = model;
  }

  async addTransaction(userId, items) {
    const insertedTransaction = await this._model.transaction.create({
      userId,
      items,
      status: 'process',
    });

    if (!insertedTransaction) {
      throw new Error('Gagal menambahkan transaksi');
    }

    await Promise.all(
      insertedTransaction.items.map(async (item) => [
        await this._model.product.updateOne({
          _id: item.productId,
        }, {
          $inc: {
            amount: -item.amount,
          },
        }),
      ]),
    );

    return insertedTransaction._id;
  }

  async getUserTransactions(userId) {
    const userTransaction = await this._model.transaction.find({
      userId,
    });

    if (!userTransaction) {
      throw new NotFoundError('Gagal mendapatkan transaksi, Id tidak ditemukan.');
    }

    return userTransaction;
  }

  async declineTransaction(transactionId) {
    const declinedTransaction = await this._model.transaction.findOneAndUpdate({
      _id: transactionId,
    }, {
      status: 'decline',
    }, {
      new: true,
    });

    if (!declinedTransaction) {
      throw new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.');
    }

    await Promise.all(
      declinedTransaction.items.map(async (item) => {
        await this._model.product.updateOne({
          _id: item.productId,
        }, {
          $inc: {
            amount: item.amount,
          },
        });
      }),
    );
  }

  async completeTransaction(transactionId) {
    const completedTransaction = await this._model.transaction.findOneAndUpdate({
      _id: transactionId,
    }, {
      status: 'done',
    }, {
      new: true,
    });

    if (!completedTransaction) {
      throw new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.');
    }
  }

  async deleteTransaction(transactionId) {
    const deleteTransaction = await this._model.transaction.findOneAndDelete({
      _id: transactionId,
    });

    if (!deleteTransaction) {
      throw new NotFoundError('Gagal menghapus transaksi, Id tidak ditemukan.');
    }
  }

  async verifyTransactionItems(items) {
    const foundedProducts = await this._model.product.find({
      _id: {
        $in: items.map((item) => item.productId),
      },
    });

    return items.map((item) => {
      const product = foundedProducts.find((prod) => prod._id === item.productId);

      if (!product) {
        throw new InvariantError('Transaksi gagal, Produk tidak ada.');
      }

      if (item.amount > product.amount) {
        throw new InvariantError('Transaksi gagal, Jumlah produk tidak cukup.');
      }

      return {
        ...item,
        subtotal: item.amount * product.price,
      };
    });
  }
}

module.exports = TransactionsService;
