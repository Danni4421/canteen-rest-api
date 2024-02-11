const mongoose = require('mongoose');
const TransactionValidator = require('../transactions');
const InvariantError = require('../../exceptions/client/InvariantError');

describe('Transaction validator test', () => {
  describe('Post transaction payload validator function test', () => {
    it('should throw error when not contain needed properties', async () => {
      const mockBadTransactionPayload = {
        items: [
          {
            productId: 1,
          },
        ],
      };

      try {
        TransactionValidator.validatePostTransactionPayload(mockBadTransactionPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"userId" is required');
      }
    });

    it('should throw error when given invalid user id type', async () => {
      const mockBadUserIdType = {
        userId: 'xxx',
        items: [
          {
            productId: 1,
            amount: 1,
          },
        ],
      };

      try {
        TransactionValidator.validatePostTransactionPayload(mockBadUserIdType);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('User id tidak valid.');
      }
    });

    it('should throw error when given bad payload', async () => {
      const mockBadUserPayload = {
        userId: new mongoose.Types.ObjectId().toString(),
        items: [
          {
            productId: '1',
            amount: 1,
          },
        ],
      };

      try {
        TransactionValidator.validatePostTransactionPayload(mockBadUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items[0].productId" must be a number');
      }
    });

    it('should throw error when not contain any items', async () => {
      const mockBadUserPayload = {
        userId: new mongoose.Types.ObjectId().toString(),
        items: [],
      };

      try {
        TransactionValidator.validatePostTransactionPayload(mockBadUserPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('"items" must contain at least 1 items');
      }
    });

    it('should not throw error when given valid payload', async () => {
      const mockValidUserPayload = {
        userId: new mongoose.Types.ObjectId().toString(),
        items: [
          {
            productId: 1,
            amount: 1,
          },
          {
            productId: 2,
            amount: 2,
          },
        ],
      };

      expect(TransactionValidator.validatePostTransactionPayload(mockValidUserPayload))
        .toBeUndefined();
    });
  });
});
