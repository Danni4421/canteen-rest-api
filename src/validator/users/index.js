const {
  PostUserSchemaValidator,
  PutUserSchemaValidator,
  PutUserPasswordSchemaValidator,
} = require('./schema');
const InvariantError = require('../../exceptions/client/InvariantError');

const UserValidator = {
  validatePostUserPayload: (payload) => {
    const validationResult = PostUserSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutUserPayload: (payload) => {
    const validationResult = PutUserSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutUserPasswordPayload: (payload) => {
    const validationResult = PutUserPasswordSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
