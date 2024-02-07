const { PostTransactionSchemaValidator } = require('./schema');
const InvariantError = require('../../exceptions/client/InvariantError');

const TransactionValidator = {
  validatePostTransactionPayload: (payload) => {
    const validationResult = PostTransactionSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TransactionValidator;
