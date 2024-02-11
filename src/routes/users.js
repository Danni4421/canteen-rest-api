const router = require('express').Router();
const User = require('../models/users');
const Cart = require('../models/carts');
const Product = require('../models/product');
const UsersHandler = require('../handlers/users');
const CartsHandler = require('../handlers/carts');
const UsersService = require('../services/mongo/users/UsersService');
const CartsService = require('../services/mongo/carts/CartsService');
const UserValidator = require('../validator/users');
const CartValidator = require('../validator/carts');
const { isAuthenticatedMiddleware } = require('../middlewares/authentication');

const usersService = new UsersService({
  user: User,
});

const cartsService = new CartsService({
  cart: Cart,
  product: Product,
});

const usersHandler = new UsersHandler(
  {
    usersService,
  },
  UserValidator,
);

const cartsHandler = new CartsHandler(
  {
    cartsService,
    usersService,
  },
  CartValidator,
);

// User Cart Routes
router.post('/cart', isAuthenticatedMiddleware, cartsHandler.postCartHandler);
router.get('/cart', isAuthenticatedMiddleware, cartsHandler.getCartHandler);
router.put('/cart', isAuthenticatedMiddleware, cartsHandler.putCartHandler);
router.delete('/cart', isAuthenticatedMiddleware, cartsHandler.deleteCartHandler);

router.post('/', usersHandler.postUsersHandler);
router.get('/me', isAuthenticatedMiddleware, usersHandler.getUserByIdHandler);
router.put('/:id', isAuthenticatedMiddleware, usersHandler.putUserByIdHandler);
router.delete('/:id', isAuthenticatedMiddleware, usersHandler.deleteUserByIdHandler);

module.exports = router;
