const mongoose = require('mongoose');
const ProductHandler = require('../products');
const InvariantError = require('../../exceptions/client/InvariantError');
const NotFoundError = require('../../exceptions/client/NotFoundError');

describe('Product Handler test', () => {
  describe('postProductHandler function', () => {
    it('should throw error when given bad payload', async () => {
      const badProductPayload = {
        name: 'Tahu Bulat',
        price: '2500',
        amount: true,
      };

      const mockProductValidator = {
        validatePostProductPayload: jest.fn().mockImplementation(() => {
          throw new InvariantError('"amount" must be a number');
        }),
      };
      const mockRequest = {
        body: badProductPayload,
      };
      const mockNext = jest.fn();

      const productHandler = new ProductHandler(null, mockProductValidator);
      await productHandler.postProductHandler(mockRequest, null, mockNext);

      expect(mockProductValidator.validatePostProductPayload).toHaveBeenCalledWith(
        badProductPayload,
      );
      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"amount" must be a number'));
    });

    it('should perform post product correctly', async () => {
      const mockProductPayload = {
        name: 'Tahu Bulat',
        price: 2000,
        amount: 5,
        images: ['tahubulat.jpg', 'tahubulat1.png'],
      };
      const mockRequest = {
        body: mockProductPayload,
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);
      const mockNext = jest.fn().mockImplementation((error) => error);

      const mockProductValidator = {
        validatePostProductPayload: jest.fn(),
      };

      const mockProductsService = {
        addProduct: jest.fn().mockImplementation(() => Promise.resolve({
          _id: 'this is product id',
        })),
      };

      const productHandler = new ProductHandler(
        {
          productsService: mockProductsService,
        },
        mockProductValidator,
      );

      await productHandler.postProductHandler(mockRequest, mockResponse, mockNext);

      expect(mockProductValidator.validatePostProductPayload).toHaveBeenCalledWith(
        mockProductPayload,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menambahkan produk',
        data: {
          id: 'this is product id',
        },
      });
    });
  });

  describe('getProductsHandler function', () => {
    it('should return all product', async () => {
      const mockProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Martabak Manis',
          price: 20000,
          amount: 10,
          images: [],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Nasi Goreng',
          price: 25000,
          amount: 5,
          images: ['nasigoreng01.jpg'],
        },
      ];

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };

      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockProductsService = {
        getProducts: jest.fn().mockImplementation(() => Promise.resolve(mockProducts)),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, null);
      const products = await productHandler.getProductsHandler(null, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil mendapatkan data produk.',
        data: mockProducts,
      });
      expect(products.status).toStrictEqual('success');
      expect(products.message).toStrictEqual('Berhasil mendapatkan data produk.');
      expect(products.data).toStrictEqual(mockProducts);
      expect(products.data).toHaveLength(2);
    });
  });

  describe('getProductByIdHandler function', () => {
    it('should throw error when the id is not valid', async () => {
      const mockRequest = {
        params: {
          id: 'xxxx', // asume it's undefined
        },
      };
      const mockNext = jest.fn();

      const mockProductsService = {
        getProductById: jest.fn().mockImplementation(() => {
          throw new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.');
        }),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, null);
      await productHandler.getProductByIdHandler(mockRequest, null, mockNext);

      expect(mockProductsService.getProductById).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.'),
      );
    });

    it('should return valid product when give valid id', async () => {
      const mockProduct = {
        _id: 1,
        name: 'Nasi Goreng',
        price: 25000,
        amount: 5,
        images: ['nasigoreng01.jpg'],
      };

      const mockRequest = {
        params: {
          id: 1,
        },
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockProductsService = {
        getProductById: jest.fn().mockImplementation(() => Promise.resolve(mockProduct)),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, null);
      const product = await productHandler.getProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockProductsService.getProductById).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil mendapatkan produk.',
        data: mockProduct,
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(product).toStrictEqual({
        status: 'success',
        message: 'Berhasil mendapatkan produk.',
        data: mockProduct,
      });
    });
  });

  describe('putProductByIdHandler function', () => {
    it('should throw error when given bad payload', async () => {
      const mockBadPayload = {
        name: true,
        price: null,
        amount: 1,
        images: [],
      };

      const mockRequest = {
        params: {
          id: 1,
        },
        body: mockBadPayload,
      };
      const mockNext = jest.fn();

      const mockValidator = {
        validatePutProductPayload: jest.fn().mockImplementation(() => {
          throw new InvariantError('"name" must be a string');
        }),
      };

      const productHandler = new ProductHandler(null, mockValidator);
      await productHandler.putProductByIdHandler(mockRequest, null, mockNext);

      expect(mockValidator.validatePutProductPayload).toHaveBeenCalledWith(mockBadPayload);
      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"name" must be a string'));
    });

    it('should throw error when given not found id', async () => {
      const mockUpdatedProduct = {
        name: 'Teh Anget',
        price: 2000,
        amount: 5,
        image: [],
      };
      const mockRequest = {
        params: {
          id: 'xxx',
        },
        body: mockUpdatedProduct,
      };
      const mockNext = jest.fn();

      const mockValidator = {
        validatePutProductPayload: jest.fn(),
      };

      const mockProductsService = {
        updateProduct: jest.fn().mockImplementation(() => {
          throw new NotFoundError('Gagal memperbarui produk, Id tidak ditemukan.');
        }),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, mockValidator);
      await productHandler.putProductByIdHandler(mockRequest, null, mockNext);

      expect(mockProductsService.updateProduct)
        .toHaveBeenCalledWith(mockRequest.params.id, mockRequest.body);
      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal memperbarui produk, Id tidak ditemukan.'),
      );
    });

    it('should perform edit product correctly', async () => {
      const mockEditPayload = {
        name: 'Nasi Goreng',
        price: 7000,
        amount: 5,
        image: [],
      };

      const mockRequest = {
        params: {
          id: 1,
        },
        body: mockEditPayload,
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockValidator = {
        validatePutProductPayload: jest.fn(),
      };

      const mockProductsService = {
        updateProduct: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, mockValidator);
      await productHandler.putProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockProductsService.updateProduct).toHaveBeenCalledWith(
        mockRequest.params.id,
        mockRequest.body,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil memperbarui produk.',
      });
    });
  });

  describe('deleteProductByIdHandler function', () => {
    it('should throw error when given not found id', async () => {
      const mockRequest = {
        params: {
          id: 'xxxx', // let say it's undefined
        },
      };
      const mockNext = jest.fn();

      const mockProductsService = {
        deleteProduct: jest.fn().mockImplementation(() => {
          throw new NotFoundError('Gagal menghapus produk, Id tidak ditemukan.');
        }),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, null);
      await productHandler.deleteProductByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal menghapus produk, Id tidak ditemukan.'),
      );
    });

    it('should perform delete product correctly', async () => {
      const mockRequest = {
        params: {
          id: 1,
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockProductsService = {
        deleteProduct: jest.fn().mockImplementation(() => Promise.resolve()),
      };

      const productHandler = new ProductHandler({
        productsService: mockProductsService,
      }, null);
      await productHandler.deleteProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockProductsService.deleteProduct).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus produk.',
      });
    });
  });
});
