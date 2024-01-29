const NotFoundError = require('../NotFoundError');

describe('NotFoundError test', () => {
  it('should create NotFoundError instance correctly', () => {
    const notFoundError = new NotFoundError('Not Found Error Message');

    expect(notFoundError.statusCode).toEqual(404);
    expect(notFoundError.name).toEqual('NotFoundError');
    expect(notFoundError.message).toEqual('Not Found Error Message');
  });
});
