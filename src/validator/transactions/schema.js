const Joi = require('joi');
const mongoose = require('mongoose');

const PostTransactionSchemaValidator = Joi.object({
  userId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message('User id tidak valid.');
    }

    return value;
  }).required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.number().required(),
    amount: Joi.number().min(1).required(),
    subtotal: Joi.number().required(),
  })).min(1).required(),
});

module.exports = {
  PostTransactionSchemaValidator,
};
