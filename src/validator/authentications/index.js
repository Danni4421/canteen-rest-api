const {
  PostAuthenticationSchemaValidator,
  PutAuthenticationSchemaValidator,
  DeleteAuthenticationSchemaValidator,
} = require('./schema');
const InvariantError = require('../../exceptions/client/InvariantError');

const AuthenticationValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthenticationSchemaValidator.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationValidator;
