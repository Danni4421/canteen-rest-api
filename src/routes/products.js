const router = require('express').Router();
const Product = require('../models/product');
const ProductsHandler = require('../handlers/products');
const ProductsService = require('../services/mongo/products/ProductsService');
const ProductsValidator = require('../validator/products');
const { isAuthenticatedMiddleware } = require('../middlewares/authentication');

const productHandler = new ProductsHandler(
  {
    productsService: new ProductsService({
      product: Product,
    }),
  },
  ProductsValidator,
);

router.post('/', isAuthenticatedMiddleware, productHandler.postProductHandler);
router.get('/:id', productHandler.getProductByIdHandler);
router.get('/', productHandler.getProductsHandler);
router.put('/:id', isAuthenticatedMiddleware, productHandler.putProductByIdHandler);
router.delete('/:id', isAuthenticatedMiddleware, productHandler.deleteProductByIdHandler);

module.exports = router;
