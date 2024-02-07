const { PostCartSchemaValidator, PutCartSchemaValidator } = require('./schema');
const InvariantError = require('../../exceptions/client/InvariantError');

const CartValidator = {
  validatePostCartPayload: (payload) => {
    const validationResult = PostCartSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutCartPayload: (payload) => {
    const validationResult = PutCartSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CartValidator;
