require('dotenv').config();
const mongoose = require('mongoose');
const Authentication = require('../authentication');

describe('Authentication model test', () => {
  const utilities = {
    insertedId: [],
  };

  beforeAll(async () => {
    try {
      const dbUrl = process.env.DB_CONNECTION || 'mongodb://localhost:27017';
      const dbName = process.env.DB_NAME || 'kantin';

      await mongoose.connect(`${dbUrl}/${dbName}`);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Authentication.deleteMany({
        _id: {
          $in: utilities.insertedId,
        },
      });
      await mongoose.disconnect();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('should perform create and return authentication correctly', async () => {
    const insertedTokens = [
      {
        userId: new mongoose.Types.ObjectId(),
        token: 'valid refresh token', // let say this is jwt token 😁
      },
      {
        userId: new mongoose.Types.ObjectId(),
        token: 'another valid refresh token', // this is too 😊
      },
    ];

    await Promise.all(
      insertedTokens.map(async ({ userId, token }) => {
        const newAuth = new Authentication({ userId, token });
        utilities.insertedId.push(newAuth._id);
        await newAuth.save();
      }),
    );

    const authentication = await Authentication.findById({
      _id: utilities.insertedId[0],
    });

    expect(authentication._id).toEqual(utilities.insertedId[0]);
    expect(authentication.userId).toEqual(insertedTokens[0].userId);
    expect(authentication.token).toEqual(insertedTokens[0].token);
  });

  it('should perform delete authentication and return deleted auth token correctly', async () => {
    const deletedId = utilities.insertedId[0];
    utilities.insertedId.slice(0, 1);

    const deletedAuth = await Authentication.findOneAndDelete({
      _id: deletedId,
    });

    const authentication = await Authentication.findOne({
      _id: deletedId,
    });

    expect(deletedAuth._id).toEqual(deletedId);
    expect(authentication).toBe(null);
  });
});
