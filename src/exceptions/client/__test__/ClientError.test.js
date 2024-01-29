const ClientError = require('../ClientError');

describe('ClientError test', () => {
  it('should create ClientError instance correctly', () => {
    const clientError = new ClientError('Client Error Message');

    expect(clientError.statusCode).toEqual(400);
    expect(clientError.name).toEqual('ClientError');
    expect(clientError.message).toEqual('Client Error Message');
  });
});
