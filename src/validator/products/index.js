const InvariantError = require('../../exceptions/client/InvariantError');
const { PostProductSchemaValidator } = require('./schema');

const ProductValidator = {
  validatePostProductPayload: (payload) => {
    const validationResult = PostProductSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductValidator;
