const router = require('express').Router();
const User = require('../models/users');
const UsersHandler = require('../handlers/users');
const UsersService = require('../services/mongo/users/UsersService');
const UserValidator = require('../validator/users');
const { isAuthenticatedMiddleware } = require('../middlewares/authentication');

const usersHandler = new UsersHandler(
  {
    usersService: new UsersService({
      user: User,
    }),
  },
  UserValidator,
);

router.post('/', usersHandler.postUsersHandler);
router.get('/me', isAuthenticatedMiddleware, usersHandler.getUserByIdHandler);
router.put('/:id', isAuthenticatedMiddleware, usersHandler.putUserByIdHandler);
router.delete('/:id', isAuthenticatedMiddleware, usersHandler.deleteUserByIdHandler);

module.exports = router;
