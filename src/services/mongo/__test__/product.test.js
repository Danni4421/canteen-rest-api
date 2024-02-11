const mongoose = require('mongoose');
const ProductsService = require('../products/ProductsService');
const NotFoundError = require('../../../exceptions/client/NotFoundError');

describe('Product service test', () => {
  describe('Add product function test', () => {
    it('should throw error when insert document failed', async () => {
      const mockInsertedProduct = {
        name: 'Ayam Stik',
        price: 2000,
        amount: 10,
        images: [
          'ayam1.png', 'ayam2.jpg',
        ],
      };

      const mockProductModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      mockProductModel.findOne = jest.fn()
        .mockImplementation(() => mockProductModel);
      mockProductModel.sort = jest.fn()
        .mockImplementation(() => mockProductModel);
      mockProductModel.limit = jest.fn()
        .mockImplementation(() => Promise.resolve(1));

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.addProduct(mockInsertedProduct))
        .rejects.toThrow(Error);
    });

    it('should not throw error when insert document is succeed', async () => {
      const mockInsertedProduct = {
        name: 'Ayam Stik',
        price: 2000,
        amount: 10,
        images: [],
      };

      const mockProductModel = {
        create: jest.fn().mockImplementation(() => Promise.resolve({
          _id: new mongoose.Types.ObjectId(),
          name: 'Ayam Stik',
          price: 2000,
          amount: 10,
          images: [],
        })),
      };

      mockProductModel.findOne = jest.fn()
        .mockImplementation(() => mockProductModel);
      mockProductModel.sort = jest.fn()
        .mockImplementation(() => mockProductModel);
      mockProductModel.limit = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.addProduct(mockInsertedProduct))
        .resolves.not.toThrow(Error);
    });
  });

  describe('Get products function test', () => {
    it('should return an empty result when the collection is empty', async () => {
      const mockProductModel = {
        find: jest.fn().mockImplementation(() => Promise.resolve([])),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      const products = await productsService.getProducts();

      expect(products).toHaveLength(0);
    });

    it('should return the expected products from the containing collection', async () => {
      const mockProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Ayam Bakar',
          price: 12000,
          amount: 5,
          images: [
            'ayambakar.jpg', 'ayambakar2.png',
          ],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Nasi Goreng',
          price: 10000,
          amount: 7,
          images: [],
        },
      ];

      const mockProductModel = {
        find: jest.fn().mockImplementation(() => Promise.resolve(mockProducts)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      const products = await productsService.getProducts();

      expect(products).toHaveLength(2);
      expect(products[0]).toStrictEqual(mockProducts[0]);
    });
  });

  describe('Get product by id function test', () => {
    it('should throw not found error when product not found', async () => {
      const mockProductModel = {
        findById: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.getProductById('xxxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return product when given valid product id', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct = {
        _id: mockProductId,
        name: 'Ayam Bakar',
        price: 12000,
        amount: 5,
        images: [],
      };

      const mockProductModel = {
        findById: jest.fn().mockImplementation(() => Promise.resolve(mockProduct)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      const product = await productsService.getProductById(mockProductId);

      expect(product).toStrictEqual(mockProduct);
      expect(product._id).toEqual(mockProductId);
    });
  });

  describe('Update product function test', () => {
    it('should throw not found error when given not found product id', async () => {
      const mockUpdateProduct = {
        name: 'Ayam Bakar Kecap',
        price: 12000,
        amount: 5,
        images: [],
      };

      const mockProductModel = {
        findOneAndReplace: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.updateProduct('xxx', mockUpdateProduct))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when given valid product id and valid payload', async () => {
      const mockProductUpdate = {
        name: 'Ayam Bakar Kecap',
        price: 12000,
        amount: 5,
        images: [
          'ayamkecap.png', 'ayambakarkecap.jpg',
        ],
      };

      const mockProductModel = {
        findOneAndReplace: jest.fn().mockImplementation(() => Promise.resolve(mockProductUpdate)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.updateProduct(1, mockProductUpdate))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Delete product function test', () => {
    it('should throw not found error when given not found product id', async () => {
      const mockProductModel = {
        findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve(null)),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.deleteProduct('xxx'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when given valid product id', async () => {
      const mockProductModel = {
        findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve({
          _id: new mongoose.Types.ObjectId(),
        })),
      };

      const productsService = new ProductsService({
        product: mockProductModel,
      });

      await expect(productsService.deleteProduct(1))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
