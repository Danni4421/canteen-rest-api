const router = require('express').Router();
const Product = require('../models/product');
const ProductHandler = require('../handlers/products');
const ProductValidator = require('../validator/products');

const productHandler = new ProductHandler(
  {
    product: Product,
  },
  ProductValidator,
);

router.post('/', productHandler.postProductHandler);
router.get('/:id', productHandler.getProductByIdHandler);
router.get('/', productHandler.getProductsHandler);
router.delete('/:id', productHandler.deleteProductByIdHandler);

module.exports = router;
