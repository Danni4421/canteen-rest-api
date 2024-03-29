const Joi = require('joi');

const PostProductSchemaValidator = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(1).required(),
  amount: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().min(1)).required(),
});

const PutProductSchemaValidator = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(1).required(),
  amount: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().min(1)).required(),
});

module.exports = {
  PostProductSchemaValidator,
  PutProductSchemaValidator,
};
