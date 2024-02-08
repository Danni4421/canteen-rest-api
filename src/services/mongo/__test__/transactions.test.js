const mongoose = require('mongoose');
const TransactionsService = require('../transactions/TransactionsService');
const NotFoundError = require('../../../exceptions/client/NotFoundError');

describe('Transaction service test', () => {
  describe('Add transaction function test', () => {
    it('should throw error when failed to insert document', async () => {
      const insertedUserId = new mongoose.Types.ObjectId();
      const insertedTransaction = {
        items: [
          {
            productId: 1,
            amount: 1,
            subtotal: 20000,
          },
        ],
      };

      const mockTransactionModel = {
        create: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.addTransaction(insertedUserId, insertedTransaction))
        .rejects.toThrow(
          new Error('Gagal menambahkan transaksi'),
        );
    });

    it('should perform add transaction when success to insert document', async () => {
      const insertedObjectId = new mongoose.Types.ObjectId();
      const insertedUserId = new mongoose.Types.ObjectId();
      const insertedTransaction = {
        items: [
          {
            productId: 1,
            amount: 1,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 3,
            subtotal: 30000,
          },
        ],
      };

      const mockTransactionModel = {
        create: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: insertedObjectId,
            userId: insertedUserId,
            items: insertedTransaction.items,
            status: 'process',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      const insertedTransactionDocument = await transactionsService.addTransaction(
        insertedUserId,
        insertedTransaction,
      );

      expect(insertedTransactionDocument).toEqual(insertedObjectId);
    });
  });

  describe('Get user transaction service function test', () => {
    it('should thorw error when user does not have any transaction', async () => {
      const mockTransactionModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.getUserTransaction('xxxx'))
        .rejects.toThrow(
          new NotFoundError('Gagal mendapatkan transaksi, Id tidak ditemukan.'),
        );
    });

    it('should perform get user transactions when user have a transaction', async () => {
      const mockUserTransaction = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [
            {
              productId: 1,
              amount: 2,
              subtotal: 20000,
            },
          ],
          status: 'process',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          items: [
            {
              productId: 1,
              amount: 1,
              subtotal: 10000,
            },
          ],
          status: 'decline',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockTransactionModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockUserTransaction)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      const userTransactions = await transactionsService.getUserTransaction(
        new mongoose.Types.ObjectId(),
      );

      expect(userTransactions).toHaveLength(2);
      expect(userTransactions[0].items).toHaveLength(1);
      expect(userTransactions[0].items[0].productId).toEqual(1);
      expect(userTransactions[0].items[0].amount).toEqual(2);
      expect(userTransactions[0].items[0].subtotal).toEqual(20000);
    });
  });

  describe('Update transaction service function test', () => {
    it('should throw error when transaction not found', async () => {
      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.updateTransaction('xxx', {}))
        .rejects.toThrow(
          new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.'),
        );
    });

    it('should perform update transaction service correctly', async () => {
      const mockRequestPayload = {
        transactionId: new mongoose.Types.ObjectId(),
        payload: {
          status: 'done',
        },
      };

      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            status: 'done',
          })),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService
        .updateTransaction(mockRequestPayload.transactionId, mockRequestPayload.payload))
        .resolves.not.toThrow(Error);
    });
  });

  describe('Delete transaction service function test', () => {
    it('should throw error when transaction not found', async () => {
      const mockTransactionModel = {
        findOneAndDelete: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.deleteTransaction('xxx'))
        .rejects.toThrow(
          new NotFoundError('Gagal menghapus transaksi, Id tidak ditemukan.'),
        );
    });

    it('should perform delete transaction service correctly', async () => {
      const mockTransactionModel = {
        findOneAndDelete: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
          })),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.deleteTransaction(new mongoose.Types.ObjectId()))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
