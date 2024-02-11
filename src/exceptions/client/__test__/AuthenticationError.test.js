const AuthenticationError = require('../AuthenticationError');

describe('AuthenticationError test', () => {
  it('should create AuthenticatinError instance correctly', () => {
    const authenticationError = new AuthenticationError('Authentication Error Message');

    expect(authenticationError.statusCode).toEqual(401);
    expect(authenticationError.name).toEqual('AuthenticationError');
    expect(authenticationError.message).toEqual('Authentication Error Message');
  });
});
