const Joi = require('joi');

const PostAuthenticationSchemaValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
});

const PutAuthenticationSchemaValidator = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationSchemaValidator = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthenticationSchemaValidator,
  PutAuthenticationSchemaValidator,
  DeleteAuthenticationSchemaValidator,
};
