const InvariantError = require('../../exceptions/client/InvariantError');
const ProductValidator = require('../products');

describe('Product Validator test', () => {
  describe('Post Product Payload Validation', () => {
    it('should throw error when not contain needed properties', () => {
      const mockPostProductPayload = {
        name: 'Roti Bakar',
        amount: 1,
      };

      try {
        ProductValidator.validatePostProductPayload(mockPostProductPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"price" is required');
      }
    });

    it('should throw error when not meet schema specification', () => {
      const mockPostProductPayload = {
        name: 'Roti Bakar',
        price: '15000',
        amount: 1,
        image: [1, true, null],
      };

      try {
        ProductValidator.validatePostProductPayload(mockPostProductPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"image[0]" must be a string');
      }
    });

    it('should not throw an error when payload meet specification', async () => {
      const mockPostProductPayload = {
        name: 'Roti Bakar',
        price: 15000,
        amount: 5,
        image: ['image1.png', 'image2.jpg'],
      };

      try {
        ProductValidator.validatePostProductPayload(mockPostProductPayload);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });

  describe('Put Product Payload Validation', () => {
    it('should throw error when not contain needed properties', () => {
      const mockPutProductPayload = {
        name: 'Roti Bakar Coklat',
        price: 8000,
      };

      try {
        ProductValidator.validatePutProductPayload(mockPutProductPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"amount" is required');
      }
    });

    it('should throw error when not meet schema specification', () => {
      const mockPutProductPayload = {
        name: 'Roti Bakar Coklat',
        price: true,
        amount: 1,
        image: [],
      };

      try {
        ProductValidator.validatePutProductPayload(mockPutProductPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"price" must be a number');
      }
    });

    it('should not throw an error when payload meet specification', () => {
      const mockPutProductPayload = {
        name: 'Roti Bakar Coklat',
        price: 8000,
        amount: 5,
        image: ['rotibakar1.png', 'rotibakar2.jpg'],
      };

      try {
        ProductValidator.validatePutProductPayload(mockPutProductPayload);
      } catch (error) {
        expect(error).toBeUndefined();
      }
    });
  });
});
