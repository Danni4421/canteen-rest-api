const passport = require('passport');

const isAuthenticatedMiddleware = (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  passport.authenticate('jwt', (err, user, info) => {
    if (info instanceof Error) {
      return res.status(401).json({
        status: 'fail',
        message: info.message,
      });
    }

    req.user = user;

    next();
  })(req, res, next);
};

module.exports = {
  isAuthenticatedMiddleware,
};
