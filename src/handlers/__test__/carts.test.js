const mongoose = require('mongoose');
const InvariantError = require('../../exceptions/client/InvariantError');
const CartsHandler = require('../carts');
const NotFoundError = require('../../exceptions/client/NotFoundError');

describe('Cart handler test', () => {
  describe('Post cart handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        items: [
          {
            productId: 1,
          },
        ],
      };

      const mockCartValidator = {
        validatePostCartPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"items[0].amount" is required');
          }),
      };

      const mockRequest = {
        body: mockBadPayload,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler(null, mockCartValidator);
      await cartsHandler.postCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('"items[0].amount" is required'),
      );
    });

    it('should throw error when failed to verify cart items', async () => {
      const mockInvalidItemProductId = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePostCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('Verifikasi item gagal, Produk tidak valid.');
          }),
      };

      const mockRequest = {
        body: mockInvalidItemProductId,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.postCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('Verifikasi item gagal, Produk tidak valid.'),
      );
    });

    it('should throw error when failed to insert document', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePostCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        addCart: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('Gagal menambahkan keranjang belanja.');
          }),
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockCartPayload,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.postCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('Gagal menambahkan keranjang belanja.'),
      );
    });

    it('should perform post cart handler function correctly', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePostCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        addCart: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockCartPayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.postCartHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menambahkan keranjang belanja.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Get cart handler function test', () => {
    it('should throw error when cart is not exists', async () => {
      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const mockCartsService = {
        getCart: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('User tidak memiliki keranjang belanja.');
          }),
      };

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, null);
      await cartsHandler.getCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('User tidak memiliki keranjang belanja.'),
      );
    });

    it('should perform get cart handler function correctly', async () => {
      const userId = new mongoose.Types.ObjectId();

      const mockCart = {
        userId,
        items: [
          {
            productId: 1,
            amount: 2,
            subtotal: 30000,
          },
        ],
      };

      const mockRequest = {
        user: {
          id: userId,
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

      const mockCartsService = {
        getCart: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockCart)),
      };

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, null);
      await cartsHandler.getCartHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenLastCalledWith({
        status: 'success',
        message: 'Berhasil mendapatkan keranjang belanja.',
        data: {
          cart: mockCart,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Put cart handler function test', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        items: [
          {
            productId: 1,
          },
        ],
      };

      const mockCartValidator = {
        validatePutCartPayload: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('"items[0].amount" is required');
          }),
      };

      const mockRequest = {
        body: mockBadPayload,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler(null, mockCartValidator);
      await cartsHandler.putCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('"items[0].amount" is required'),
      );
    });

    it('should throw error when failed to verify cart items', async () => {
      const mockInvalidItemProductId = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePutCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => {
            throw new InvariantError('Verifikasi item gagal, Produk tidak valid.');
          }),
      };

      const mockRequest = {
        body: mockInvalidItemProductId,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.putCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new InvariantError('Verifikasi item gagal, Produk tidak valid.'),
      );
    });

    it('should throw error when failed to update document', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePutCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        updateCart: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal memperbarui keranjang belanja. User tidak memiliki keranjang.');
          }),
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockCartPayload,
      };

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.putCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal memperbarui keranjang belanja. User tidak memiliki keranjang.'),
      );
    });

    it('should perform update cart handler function correctly', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      };

      const mockCartValidator = {
        validatePutCartPayload: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockCartsService = {
        updateCart: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
        verifyCartItems: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
        body: mockCartPayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, mockCartValidator);
      await cartsHandler.putCartHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil memperbarui keranjang belanja.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Delete cart handler test', () => {
    it('should throw error when user does not have cart', async () => {
      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
          role: 'user',
        },
      };

      const mockNext = jest.fn();

      const mockCartsService = {
        deleteCart: jest
          .fn()
          .mockImplementation(() => {
            throw new NotFoundError('Gagal menghapus keranjang belanja. User tidak memiliki keranjang.');
          }),
      };

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, null);
      await cartsHandler.deleteCartHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal menghapus keranjang belanja. User tidak memiliki keranjang.'),
      );
    });

    it('should perform delete cart handler function correctly', async () => {
      const mockRequest = {
        user: {
          id: new mongoose.Types.ObjectId(),
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

      const mockCartsService = {
        deleteCart: jest
          .fn()
          .mockImplementation(() => Promise.resolve()),
      };

      const cartsHandler = new CartsHandler({
        cartsService: mockCartsService,
      }, null);
      await cartsHandler.deleteCartHandler(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus keranjang belanja.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
