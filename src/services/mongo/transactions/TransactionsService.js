const NotFoundError = require('../../../exceptions/client/NotFoundError');

class TransactionsService {
  constructor(model) {
    this._model = model;
  }

  async addTransaction(userId, { items }) {
    const insertedTransaction = await this._model.transaction.create({
      userId,
      items,
      status: 'process',
    });

    if (!insertedTransaction) {
      throw new Error('Gagal menambahkan transaksi');
    }

    return insertedTransaction._id;
  }

  async getUserTransaction(userId) {
    const userTransaction = await this._model.transaction.find({
      userId,
    });

    if (!userTransaction) {
      throw new NotFoundError('Gagal mendapatkan transaksi, Id tidak ditemukan.');
    }

    return userTransaction;
  }

  async updateTransaction(transactionId, { status }) {
    const updatedTransaction = await this._model.transaction.findOneAndUpdate({
      _id: transactionId,
    }, {
      status,
    }, {
      new: true,
    });

    if (!updatedTransaction) {
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
}

module.exports = TransactionsService;
