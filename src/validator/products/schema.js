const Joi = require('joi');

const PostProductSchemaValidator = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(1).required(),
  amount: Joi.number().min(0).required(),
  image: Joi.array().items(Joi.string().min(1)),
});

module.exports = {
  PostProductSchemaValidator,
};
