const ProductHandler = require('../products');
const { generateObjectId } = require('../../../tests/HandlerTestHelper');
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
        validatePostProductPayload: jest.fn().mockImplementation((payload) => {
          throw new InvariantError(`"amount" must be a number`);
        }),
      };
      const mockRequest = { body: { ...badProductPayload } };
      const mockNext = jest.fn();

      const productHandler = new ProductHandler(null, mockProductValidator);
      await productHandler.postProductHandler(mockRequest, null, mockNext);

      expect(mockProductValidator.validatePostProductPayload).toHaveBeenCalledWith(
        badProductPayload
      );
      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"amount" must be a number'));
    });

    it('should perform post product correctly', async () => {
      const mockProductPayload = {
        name: 'Tahu Bulat',
        price: 2000,
        amount: 5,
        image: ['tahubulat.jpg', 'tahubulat1.png'],
      };
      const mockRequest = { body: { ...mockProductPayload } };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      const mockNext = jest.fn().mockImplementation((error) => error);

      const mockModel = {
        product: {
          create: jest.fn().mockImplementation(() => Promise.resolve()),
        },
      };
      const mockProductValidator = {
        validatePostProductPayload: jest.fn(),
      };

      const productHandler = new ProductHandler(mockModel, mockProductValidator);
      await productHandler.postProductHandler(mockRequest, mockResponse, mockNext);

      expect(mockProductValidator.validatePostProductPayload).toHaveBeenCalledWith(
        mockProductPayload
      );
      expect(mockModel.product.create).toHaveBeenCalledWith({ ...mockProductPayload });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockNext).toHaveReturned();
    });
  });

  describe('getProductsHandler function', () => {
    it('should return all product', async () => {
      const mockProducts = [
        {
          _id: 'hjru87keio45o23klk34j',
          name: 'Martabak Manis',
          price: 20000,
          amount: 10,
          image: [],
        },
        {
          _id: 'yj5uj7gehgo4cov3blh25h',
          name: 'Nasi Goreng',
          price: 25000,
          amount: 5,
          image: ['nasigoreng01.jpg'],
        },
      ];

      const mockModel = {
        product: {
          find: jest.fn().mockImplementation(() => {
            return Promise.resolve(mockProducts);
          }),
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };

      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const productHandler = new ProductHandler(mockModel, null);
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
    it('should throw InvariantError when given invalid id', async () => {
      const mockRequest = {
        params: {
          id: 'xxxx',
        },
      };

      const mockNext = jest.fn();

      const productHandler = new ProductHandler(null, null);
      await productHandler.getProductByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('Id tidak valid.'));
    });

    it('should throw NotFoundError when the id is not valid', async () => {
      const notFoundProductId = generateObjectId();

      const mockRequest = {
        params: {
          id: notFoundProductId, // asume the id is undefined
        },
      };
      const mockNext = jest.fn();

      const mockModel = {
        product: {
          findById: jest.fn().mockImplementation(() => Promise.resolve(null)),
        },
      };

      const productHandler = new ProductHandler(mockModel, null);
      await productHandler.getProductByIdHandler(mockRequest, null, mockNext);

      expect(mockModel.product.findById).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal mendapatkan produk, Id tidak ditemukan.')
      );
    });

    it('should return valid product when give valid id', async () => {
      const productId = generateObjectId();

      const mockProduct = {
        _id: productId,
        name: 'Nasi Goreng',
        price: 25000,
        amount: 5,
        image: ['nasigoreng01.jpg'],
      };
      const mockModel = {
        product: {
          findById: jest.fn().mockImplementation((id) => {
            if (id === mockProduct._id) {
              return Promise.resolve(mockProduct);
            }
          }),
        },
      };
      const mockRequest = {
        params: {
          id: productId,
        },
      };
      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const productHandler = new ProductHandler(mockModel, null);
      const product = await productHandler.getProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext
      );

      expect(mockModel.product.findById).toHaveBeenCalledWith(mockRequest.params.id);
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
    it('should throw InvariantError when given invalid id', async () => {
      const mockRequest = {
        params: {
          id: 'xxxx',
        },
      };

      const mockNext = jest.fn();

      const productHandler = new ProductHandler(null, null);
      await productHandler.putProductByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('Id tidak valid.'));
    });

    it('should throw NotFoundError when given not found id', async () => {
      const notFoundProductId = generateObjectId();

      const mockUpdatedProduct = {
        name: 'Teh Anget',
        price: 2000,
        amount: 5,
        image: [],
      };
      const mockRequest = { params: { id: notFoundProductId }, body: mockUpdatedProduct };
      const mockNext = jest.fn();

      const mockModel = {
        product: {
          findOneAndReplace: jest.fn().mockImplementation(() => Promise.resolve(null)),
        },
      };

      const mockValidator = {
        validatePutProductPayload: jest.fn(),
      };

      const productHandler = new ProductHandler(mockModel, mockValidator);
      await productHandler.putProductByIdHandler(mockRequest, null, mockNext);

      expect(mockModel.product.findOneAndReplace).toHaveBeenCalledWith(
        { _id: mockRequest.params.id },
        mockRequest.body
      );
      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal memperbarui produk, Id tidak ditemukan.')
      );
    });

    it('should throw InvariantError when given bad payload', async () => {
      const productId = generateObjectId();

      const mockBadPayload = {
        name: true,
        price: null,
        amount: 1,
        image: [],
      };

      const mockRequest = { params: { id: productId }, body: mockBadPayload };
      const mockNext = jest.fn();

      const mockModel = {
        product: {
          findOneAndReplace: jest.fn(),
        },
      };

      const mockValidator = {
        validatePutProductPayload: jest.fn().mockImplementation(() => {
          throw new InvariantError('"name" must be a string');
        }),
      };

      const productHandler = new ProductHandler(mockModel, mockValidator);
      await productHandler.putProductByIdHandler(mockRequest, null, mockNext);

      expect(mockValidator.validatePutProductPayload).toHaveBeenCalledWith(mockBadPayload);
      expect(mockModel.product.findOneAndReplace).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(new InvariantError('"name" must be a string'));
    });

    it('should perform edit product correctly', async () => {
      const productId = generateObjectId();

      const mockEditPayload = {
        name: 'Nasi Goreng',
        price: 7000,
        amount: 5,
        image: [],
      };

      const mockRequest = {
        params: {
          id: productId,
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

      const mockModel = {
        product: {
          findOneAndReplace: jest
            .fn()
            .mockImplementation(() => Promise.resolve({ _id: productId })),
        },
      };

      const mockValidator = {
        validatePutProductPayload: jest.fn(),
      };

      const productHandler = new ProductHandler(mockModel, mockValidator);
      const response = await productHandler.putProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext
      );

      expect(mockModel.product.findOneAndReplace).toHaveBeenCalledWith(
        { _id: mockRequest.params.id },
        mockEditPayload
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil memperbarui produk.',
      });
      expect(response).toStrictEqual({
        status: 'success',
        message: 'Berhasil memperbarui produk.',
      });
    });
  });

  describe('deleteProductByIdHandler function', () => {
    it('should throw InvariantError when given invalid id', async () => {
      const mockRequest = {
        params: {
          _id: 'xxxx',
        },
      };

      const mockNext = jest.fn();

      const productHandler = new ProductHandler(null, null);
      await productHandler.deleteProductByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new InvariantError('Id tidak valid.'));
    });

    it('should throw NotFoundError when given not found id', async () => {
      const notFoundProductId = generateObjectId();

      const mockRequest = {
        params: {
          id: notFoundProductId,
        },
      };
      const mockNext = jest.fn();

      const mockModel = {
        product: {
          findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve(null)),
        },
      };

      const productHandler = new ProductHandler(mockModel, null);
      await productHandler.deleteProductByIdHandler(mockRequest, null, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new NotFoundError('Gagal menghapus produk, Id tidak ditemukan.')
      );
    });

    it('should perform delete product correctly', async () => {
      const productId = generateObjectId();

      const mockRequest = {
        params: {
          id: productId,
        },
      };

      const mockResponse = {
        status: jest.fn(),
        json: jest.fn(),
      };
      mockResponse.status.mockImplementation(() => mockResponse);
      mockResponse.json.mockImplementation((response) => response);

      const mockNext = jest.fn();

      const mockModel = {
        product: {
          findOneAndDelete: jest.fn().mockImplementation(() => Promise.resolve({ _id: productId })),
        },
      };

      const productHandler = new ProductHandler(mockModel, null);
      const response = await productHandler.deleteProductByIdHandler(
        mockRequest,
        mockResponse,
        mockNext
      );

      expect(mockModel.product.findOneAndDelete).toHaveBeenCalledWith(
        { _id: productId },
        { _id: 1 }
      );
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Berhasil menghapus produk.',
      });
      expect(response).toStrictEqual({
        status: 'success',
        message: 'Berhasil menghapus produk.',
      });
    });
  });
});
