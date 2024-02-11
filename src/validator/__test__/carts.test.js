const InvariantError = require('../../exceptions/client/InvariantError');
const CartValidator = require('../carts');

describe('Cart validator test', () => {
  describe('Post cart payload validator function test', () => {
    it('should throw error when not contain needed properties', async () => {
      const mockBadCartPayload = {
        items: [
          {
            amount: 1,
          },
        ],
      };

      try {
        CartValidator.validatePostCartPayload(mockBadCartPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items[0].productId" is required');
      }
    });

    it('should throw error when not meet schema specification', async () => {
      const mockBadCartPayload = {
        items: [
          {
            productId: '1',
            amount: 1,
          },
        ],
      };

      try {
        CartValidator.validatePostCartPayload(mockBadCartPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items[0].productId" must be a number');
      }
    });

    it('should not throw error when given valid payload', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 1,
          },
          {
            productId: 2,
            amount: 3,
          },
        ],
      };

      expect(CartValidator.validatePostCartPayload(mockCartPayload))
        .toBeUndefined();
    });
  });

  describe('Put cart payload validator function test', () => {
    it('should throw error when not contain needed properties', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
          },
        ],
      };

      try {
        CartValidator.validatePutCartPayload(mockCartPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items[0].amount" is required');
      }
    });

    it('should throw error when not meet schema specification', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: '2',
          },
        ],
      };

      try {
        CartValidator.validatePutCartPayload(mockCartPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items[0].amount" must be a number');
      }
    });

    it('should not throw error when given valid payload', async () => {
      const mockCartPayload = {
        items: [
          {
            productId: 1,
            amount: 2,
          },
          {
            productId: 2,
            amount: 1,
          },
        ],
      };

      expect(CartValidator.validatePutCartPayload(mockCartPayload))
        .toBeUndefined();
    });
  });
});
