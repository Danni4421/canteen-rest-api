const router = require('express').Router();
const User = require('../models/users');
const Authentication = require('../models/authentication');
const AuthenticationsHandler = require('../handlers/authentications');
const AuthenticationsService = require('../services/mongo/authentications/AuthenticationsService');
const AuthenticationValidator = require('../validator/authentications');
const UsersService = require('../services/mongo/users/UsersService');
const TokenManager = require('../tokenize/TokenManager');

const authenticationHandler = new AuthenticationsHandler(
  {
    usersService: new UsersService({
      user: User,
    }),
    authenticationsService: new AuthenticationsService({
      authentication: Authentication,
    }),
  },
  AuthenticationValidator,
  TokenManager,
);

router.post('/', authenticationHandler.postAuthenticationHandler);
router.put('/', authenticationHandler.putAuthenticationHandler);
router.delete('/', authenticationHandler.deleteAuthenticationHandler);

module.exports = router;
