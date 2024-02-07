const Joi = require('joi');

const PostCartSchemaValidator = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      amount: Joi.number().min(1).required(),
    }),
  ).min(1).required(),
});

const PutCartSchemaValidator = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      amount: Joi.number().min(1).required(),
    }),
  ).min(1).required(),
});

module.exports = {
  PostCartSchemaValidator,
  PutCartSchemaValidator,
};
