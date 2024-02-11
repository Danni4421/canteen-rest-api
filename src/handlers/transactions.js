const mongoose = require('mongoose');
const autoBind = require('auto-bind');
const InvariantError = require('../exceptions/client/InvariantError');

class TransactionsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postTransactionHandler(req, res, next) {
    try {
      this._validator.validatePostTransactionPayload(req.body);

      const validatedItems = await this._service.transactionsService
        .verifyTransactionItems(req.body.items);

      const transactionId = await this._service
        .transactionsService.addTransaction(req.user.id, validatedItems);

      return res.status(201).json({
        status: 'success',
        message: 'Berhasil menambahkan transaksi.',
        data: {
          transactionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionsHandler(req, res, next) {
    try {
      const transactions = await this._service.transactionsService
        .getUserTransactions(req.user.id);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mendapatkan transaksi user.',
        data: {
          transactions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async declineTransactionHandler(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.transactionId)) {
        throw new InvariantError('Transaction id tidak valid.');
      }

      await this._service.transactionsService
        .declineTransaction(req.params.transactionId);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menolak transaksi.',
      });
    } catch (error) {
      next(error);
    }
  }

  async completeTransactionHandler(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.transactionId)) {
        throw new InvariantError('Transaction id tidak valid.');
      }

      await this._service.transactionsService.completeTransaction(req.params.transactionId);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil, Transaksi telah selesai.',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransactionHandler(req, res, next) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.transactionId)) {
        throw new InvariantError('Transaction id tidak valid.');
      }

      await this._service.transactionsService.deleteTransaction(req.params.transactionId);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil menghapus transaksi.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionsHandler;
