const mongoose = require('mongoose');
const TransactionsService = require('../transactions/TransactionsService');
const NotFoundError = require('../../../exceptions/client/NotFoundError');
const InvariantError = require('../../../exceptions/client/InvariantError');

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

      const mockProductModel = {
        updateOne: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
        product: mockProductModel,
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

      await expect(transactionsService.getUserTransactions('xxxx'))
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

      const userTransactions = await transactionsService.getUserTransactions(
        new mongoose.Types.ObjectId(),
      );

      expect(userTransactions).toHaveLength(2);
      expect(userTransactions[0].items).toHaveLength(1);
      expect(userTransactions[0].items[0].productId).toEqual(1);
      expect(userTransactions[0].items[0].amount).toEqual(2);
      expect(userTransactions[0].items[0].subtotal).toEqual(20000);
    });
  });

  describe('Decline transaction service function test', () => {
    it('should throw not found error when given not found transaction', async () => {
      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.declineTransaction('xxx'))
        .rejects.toThrow(
          new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.'),
        );
    });

    it('should perform decline transaction service function correctly', async () => {
      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
            items: [
              {
                productId: 1,
                amount: 2,
                subtotal: 20000,
              },
            ],
          })),
      };

      const mockProductModel = {
        updateOne: jest
          .fn()
          .mockImplementation(() => Promise.resolve({})),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
        product: mockProductModel,
      });

      expect(await transactionsService.declineTransaction(
        new mongoose.Types.ObjectId(),
      )).toBeUndefined();
    });
  });

  describe('Complete transaction service function test', () => {
    it('should throw error when given not found transaction', async () => {
      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      await expect(transactionsService.completeTransaction('xxx'))
        .rejects.toThrow(
          new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.'),
        );
    });

    it('should perform complete transaction service function correctly', async () => {
      const mockTransactionModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
          })),
      };

      const transactionsService = new TransactionsService({
        transaction: mockTransactionModel,
      });

      expect(await transactionsService.completeTransaction(
        new mongoose.Types.ObjectId(),
      )).toBeUndefined();
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

  describe('Verify transaction service function test', () => {
    it('should throw error when product not found', async () => {
      const transactionItems = [
        {
          productId: 1,
          amount: 2,
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve([])),
      };

      const transactionsService = new TransactionsService({
        product: mockProductModel,
      });

      await expect(transactionsService.verifyTransactionItems(transactionItems))
        .rejects.toThrow(
          new InvariantError('Transaksi gagal, Produk tidak ada.'),
        );
    });

    it('should throw error when product amount is not enough', async () => {
      const transactionItems = [
        {
          productId: 1,
          amount: 2,
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve([
            {
              _id: 1,
              amount: 1,
              price: 15000,
            },
          ])),
      };

      const transactionsService = new TransactionsService({
        product: mockProductModel,
      });

      await expect(transactionsService.verifyTransactionItems(transactionItems))
        .rejects.toThrow(
          new InvariantError('Transaksi gagal, Jumlah produk tidak cukup.'),
        );
    });

    it('should perform verify transaction items service correctly', async () => {
      const transactionItems = [
        {
          productId: 1,
          amount: 2,
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve([
            {
              _id: 1,
              amount: 3,
              price: 15000,
            },
          ])),
      };

      const transactionsService = new TransactionsService({
        product: mockProductModel,
      });

      const validatedItems = await transactionsService
        .verifyTransactionItems(transactionItems);

      expect(validatedItems[0].productId).toEqual(transactionItems[0].productId);
      expect(validatedItems[0].amount).toEqual(transactionItems[0].amount);
      expect(validatedItems[0].subtotal).toEqual(30000);
    });
  });
});
