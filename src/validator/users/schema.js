const Joi = require('joi');

const PostUserSchemaValidator = Joi.object({
  username: Joi.string().max(50).required(),
  firstname: Joi.string().max(50).required(),
  lastname: Joi.string().max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
  role: Joi.string().valid('admin', 'user').required(),
});

const PutUserSchemaValidator = Joi.object({
  username: Joi.string().max(50),
  firstname: Joi.string().max(50),
  lastname: Joi.string().max(50),
  email: Joi.string().email(),
});

const PutUserPasswordSchemaValidator = Joi.object({
  password: Joi.string().min(8).max(20).required(),
});

module.exports = {
  PostUserSchemaValidator,
  PutUserSchemaValidator,
  PutUserPasswordSchemaValidator,
};
