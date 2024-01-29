const InvariantError = require('../../exceptions/client/InvariantError');
const ProductValidator = require('../products');

describe('Product Validator test', () => {
  it('should throw error when not contain needed properties', () => {
    const mockProductPayload = {
      name: 'Roti Bakar',
      amount: 1,
    };

    try {
      ProductValidator.validatePostProductPayload(mockProductPayload);
    } catch (error) {
      expect(error).toBeInstanceOf(InvariantError);
      expect(error.statusCode).toEqual(400);
      expect(error.message).toEqual('"price" is required');
    }
  });

  it('should throw error when not meet schema specification', () => {
    const mockProductPayload = {
      name: 'Roti Bakar',
      price: '15000',
      amount: 1,
      image: [1, true, null],
    };

    try {
      ProductValidator.validatePostProductPayload(mockProductPayload);
    } catch (error) {
      expect(error).toBeInstanceOf(InvariantError);
      expect(error.statusCode).toEqual(400);
      expect(error.message).toEqual('"image[0]" must be a string');
    }
  });

  it('should not throw an error when payload meet specification', async () => {
    const mockProductPayload = {
      name: 'Roti Bakar',
      price: 15000,
      amount: 5,
      image: ['image1.png', 'image2.jpg'],
    };

    try {
      ProductValidator.validatePostProductPayload(mockProductPayload);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
});
