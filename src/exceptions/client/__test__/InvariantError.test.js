const InvariantError = require('../InvariantError');

describe('InvariantError test', () => {
  it('should create InvariantError instance correctly', () => {
    const invariantError = new InvariantError('Invariant Error Message');

    expect(invariantError.statusCode).toEqual(400);
    expect(invariantError.name).toEqual('InvariantError');
    expect(invariantError.message).toEqual('Invariant Error Message');
  });
});
