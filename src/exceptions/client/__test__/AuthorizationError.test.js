const AuthorizationError = require('../AuthorizationError');

describe('AuthorizationError test', () => {
  it('should create AuthenticatinError instance correctly', () => {
    const authorizationError = new AuthorizationError('Authorization Error Message');

    expect(authorizationError.statusCode).toEqual(403);
    expect(authorizationError.name).toEqual('AuthorizationError');
    expect(authorizationError.message).toEqual('Authorization Error Message');
  });
});
