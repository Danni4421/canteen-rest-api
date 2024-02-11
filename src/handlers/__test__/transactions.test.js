const mongoose = require('mongoose');
const TransactionsHandler = require('../transactions');
const InvariantError = require('../../exceptions/client/InvariantError');
const NotFoundError = require('../../exceptions/client/NotFoundError');

describe('Transaction handler test', () => {
  describe('Post transaction handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockTransactionPayload = {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            // productId: 1,
            amount: 2,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 3,
            subtotal: 35000,
          },
        ],
      };

      const mockTransactionValidator = {
        validatePostTransactionPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"items[0].productId" is required');
          }),
      };

      const mockRequest = {
        body: mockTransactionPayload,
      };

      const mockNext = jest.fn();

      const transactionsHandler = new TransactionsHandler(null, mockTransactionValidator);
      await transactionsHandler.postTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('"items[0].productId" is required'),
      );
    });

    it('should throw error when transactions are not verified', async () => {
      const mockTransactionPayload = {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 1, // asume this id not found
            amount: 2,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 3,
            subtotal: 35000,
          },
        ],
      };

      const mockTransactionValidator = {
        validatePostTransactionPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockTransactionsService = {
        verifyTransactionItems: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('Transaksi gagal, Produk tidak ada.');
          }),
      };

      const mockRequest = {
        body: mockTransactionPayload,
      };

      const mockNext = jest.fn();

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, mockTransactionValidator);

      await transactionsHandler.postTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('Transaksi gagal, Produk tidak ada.'),
      );
    });

    it('should throw error when fail to insert transaction document', async () => {
      const mockTransactionPayload = {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 1, // asume this id not found
            amount: 2,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 3,
            subtotal: 35000,
          },
        ],
      };

      const mockTransactionValidator = {
        validatePostTransactionPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockTransactionsService = {
        addTransaction: jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Gagal menambahkan transaksi');
          }),
        verifyTransactionItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockTransactionPayload,
      };

      const mockNext = jest.fn();

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, mockTransactionValidator);

      await transactionsHandler.postTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new Error('Gagal menambahkan transaksi'),
      );
    });

    it('should perform add transaction handler function test', async () => {
      const mockTransactionPayload = {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 1,
            amount: 2,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 3,
            subtotal: 35000,
          },
        ],
      };

      const mockTransactionValidator = {
        validatePostTransactionPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockTransactionsService = {
        addTransaction: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
        verifyTransactionItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockTransactionPayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, mockTransactionValidator);

      await transactionsHandler.postTransactionHandler(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Get transactions handler function test', () => {
    it('should throw not found error when user does not have any transactions yet', async () => {
      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const mockTransactionsService = {
        getUserTransactions: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal mendapatkan transaksi, Id tidak ditemukan.');
          }),
      };

      const transactionsService = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      const transaction = await transactionsService
        .getTransactionsHandler(mockRequest, null, mockNext);

      expect(transaction).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal mendapatkan transaksi, Id tidak ditemukan.'),
      );
    });

    it('should perform get user transaction correctny', async () => {
      const mockUser = new mongoose.Types.ObjectId();
      const mockUserTransactions = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: mockUser,
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
          userId: mockUser,
          items: [
            {
              productId: 2,
              amount: 1,
              subtotal: 30000,
            },
          ],
          status: 'done',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockTransactionsService = {
        getUserTransactions: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockUserTransactions)),
      };

      const mockRequest = {
        user: {
          id: mockUser,
          role: 'user',
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      const { data: { transactions } } = await transactionsHandler
        .getTransactionsHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil mendapatkan transaksi user.',
        data: {
          transactions: mockUserTransactions,
        },
      });
      expect(transactions).toStrictEqual(mockUserTransactions);
    });
  });

  describe('Decline transaction handler function test', () => {
    it('should throw not found error when given not found transaction', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockNext = jest.fn();

      const mockTransactionsService = {
        declineTransaction: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.');
          }),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.declineTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.'),
      );
    });

    it('should perform decline transaction handler function test', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockTransactionsService = {
        declineTransaction: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.declineTransactionHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menolak transaksi.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Complete transaction handler function test', () => {
    it('should throw not found error when transaction not found', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockNext = jest.fn();

      const mockTransactionsService = {
        completeTransaction: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.');
          }),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.completeTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal memperbarui transaksi, Id tidak ditemukan.'),
      );
    });

    it('should perform complete transaction handler function correctly', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockTransactionsService = {
        completeTransaction: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.completeTransactionHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil, Transaksi telah selesai.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Delete transaction handler function test', () => {
    it('should throw not found error when transaction not found', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockNext = jest.fn();

      const mockTransactionsService = {
        deleteTransaction: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal menghapus transaksi, Id tidak ditemukan.');
          }),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.deleteTransactionHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal menghapus transaksi, Id tidak ditemukan.'),
      );
    });

    it('should perform delete transaction handler function correctly', async () => {
      const mockRequest = {
        params: {
          transactionId: new mongoose.Types.ObjectId(),
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockTransactionsService = {
        deleteTransaction: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const transactionsHandler = new TransactionsHandler({
        transactionsService: mockTransactionsService,
      }, null);

      await transactionsHandler.deleteTransactionHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus transaksi.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
