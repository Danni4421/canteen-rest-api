const { default: mongoose } = require('mongoose');
const CartsService = require('../carts/CartsService');
const NotFoundError = require('../../../exceptions/client/NotFoundError');
const InvariantError = require('../../../exceptions/client/InvariantError');

describe('Cart service test', () => {
  describe('Add cart service function test', () => {
    it('should throw error when failed to insert document', async () => {
      const mockCartModel = {
        create: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const mockUserId = new mongoose.Types.ObjectId();
      const mockItems = [];

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.addCart(mockUserId, mockItems)).rejects.toThrow(
        new Error('Gagal menambahkan keranjang belanja.'),
      );
    });

    it('should perform add cart service function correctly', async () => {
      const mockUserId = new mongoose.Types.ObjectId();
      const mockItems = [
        {
          productId: 1,
          amount: 1,
          subtotal: 20000,
        },
      ];

      const mockInsertedProduct = {
        _id: new mongoose.Types.ObjectId(),
        userId: mockUserId,
        items: mockItems,
      };

      const mockCartModel = {
        create: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockInsertedProduct)),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.addCart(mockUserId, mockItems))
        .resolves.not.toThrow(Error);
    });
  });

  describe('Get cart service function test', () => {
    it('should throw not found error when user does not have cart', async () => {
      const mockUserId = new mongoose.Types.ObjectId();

      const mockCartModel = {
        findOne: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.getCart(mockUserId))
        .rejects.toThrow(NotFoundError);
    });

    it('should perform get cart service correctly', async () => {
      const mockUserId = new mongoose.Types.ObjectId();

      const mockCartModel = {
        findOne: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            userId: mockUserId,
          })),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      const cart = await cartsService.getCart(mockUserId);

      expect(cart.userId).toEqual(mockUserId);
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('Put cart service function test', () => {
    it('should throw not found error when user does not have cart', async () => {
      const mockUserId = new mongoose.Types.ObjectId(); // let say this id doesn't have a cart

      const mockUpdateItems = [
        {
          productId: 1,
          amount: 2,
          subtotal: 20000,
        },
      ];

      const mockCartModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.updateCart(mockUserId, mockUpdateItems))
        .rejects.toThrow(NotFoundError);
    });

    it('should perform update cart service function correctly', async () => {
      const mockUserId = new mongoose.Types.ObjectId();

      const mockUpdatedItems = [
        {
          productId: 1,
          amount: 2,
          subtotal: 20000,
        },
      ];

      const mockCartModel = {
        findOneAndUpdate: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
            userId: mockUserId,
            items: mockUpdatedItems,
          })),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.updateCart(mockUserId, mockUpdatedItems))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Delete cart service function test', () => {
    it('should throw not found error when user does not have a cart', async () => {
      const mockUserId = new mongoose.Types.ObjectId(); // let say this id doesn't have a cart

      const mockCartModel = {
        findOneAndDelete: jest
          .fn()
          .mockImplementation(() => Promise.resolve(null)),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.deleteCart(mockUserId))
        .rejects.toThrow(NotFoundError);
    });

    it('should perform delete cart service function correctly', async () => {
      const mockUserId = new mongoose.Types.ObjectId();

      const mockCartModel = {
        findOneAndDelete: jest
          .fn()
          .mockImplementation(() => Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
            userId: mockUserId,
            items: [
              // imagine there is some product here
            ],
          })),
      };

      const cartsService = new CartsService({
        cart: mockCartModel,
      });

      await expect(cartsService.deleteCart(mockUserId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Verify cart items service function test', () => {
    it('should throw error when product does not exists in collection', async () => {
      const mockUserCartItems = [
        { productId: 1, amount: 2 },
        { productId: 2, amount: 1 },
        { productId: 3, amount: 4 },
      ];
      const mockProductCollection = [
        {
          _id: 2,
          name: 'Ayam Goreng',
          price: 15000,
          amount: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockProductCollection)),
      };

      const cartsService = new CartsService({
        product: mockProductModel,
      });

      await expect(cartsService.verifyCartItems(mockUserCartItems))
        .rejects.toThrow(
          new InvariantError('Verifikasi item gagal, Produk tidak valid.'),
        );
    });

    it('should throw error when amount of cart items is greater than actual product amount', async () => {
      const mockUserCartItems = [
        {
          productId: 2,
          amount: 3,
        },
      ];
      const mockProductCollection = [
        {
          _id: 2,
          name: 'Ayam Goreng',
          price: 15000,
          amount: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockProductCollection)),
      };

      const cartsService = new CartsService({
        product: mockProductModel,
      });

      await expect(cartsService.verifyCartItems(mockUserCartItems))
        .rejects.toThrow(
          new InvariantError('Verifikasi item gagal, Jumlah produk tidak cukup.'),
        );
    });

    it('should perform verify user cart items correctly', async () => {
      const mockUserCartItems = [
        {
          productId: 2,
          amount: 1,
        },
      ];
      const mockProductCollection = [
        {
          _id: 2,
          name: 'Ayam Goreng',
          price: 15000,
          amount: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockProductModel = {
        find: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockProductCollection)),
      };

      const cartsService = new CartsService({
        product: mockProductModel,
      });

      const verifiedItems = await cartsService.verifyCartItems(mockUserCartItems);

      expect(verifiedItems[0]).toStrictEqual({
        ...mockUserCartItems[0],
        subtotal: mockUserCartItems[0].amount * mockProductCollection[0].price,
      });
    });
  });
});
