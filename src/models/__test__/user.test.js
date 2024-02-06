require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../users');

describe('Database User Model test', () => {
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
      await User.deleteMany({
        _id: utilities.insertedId,
      });
      await mongoose.disconnect();
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  it('should perform create and return user correctly', async () => {
    const insertedUser = [
      {
        username: 'user1',
        firstname: 'yudi',
        lastname: 'junaidi',
        email: 'user1@kantinjti.com',
        password: '12345678',
        role: 'admin',
      },
      {
        username: 'user2',
        firstname: 'jupri',
        lastname: 'sukirman',
        email: 'user2@kantinjti.com',
        password: '87654321',
        role: 'user',
      },
    ];

    await Promise.all(
      insertedUser.map(async (user) => {
        const newUser = new User({
          ...user,
          fullname: {
            firstname: user.firstname,
            lastname: user.lastname,
          },
        });
        utilities.insertedId.push(newUser._id);
        await newUser.save();
      }),
    );

    const user = await User.findById({
      _id: utilities.insertedId[0],
    });

    expect(user._id).toEqual(utilities.insertedId[0]);
    expect(user.username).toEqual('user1');
    expect(user.fullname).toEqual({
      firstname: 'yudi',
      lastname: 'junaidi',
    });
    expect(user.email).toEqual('user1@kantinjti.com');
    expect(user.password).toEqual('12345678');
    expect(user.role).toEqual('admin');
  });

  it('should perform edit and return edited user correctly', async () => {
    const mockReplaceUserDetail = {
      username: 'admin1',
      fullname: {
        firstname: 'yuli',
        lastname: 'yulianti',
      },
      email: 'admin1@kantinjti.com',
      password: '87654321',
      role: 'admin',
    };

    await User.findOneAndReplace(
      {
        _id: utilities.insertedId[0],
      },
      mockReplaceUserDetail,
    );

    const updatedUser = await User.findById({
      _id: utilities.insertedId[0],
    });

    expect(updatedUser.username).toEqual('admin1');
    expect(updatedUser.fullname).toEqual({
      firstname: 'yuli',
      lastname: 'yulianti',
    });
    expect(updatedUser.email).toEqual('admin1@kantinjti.com');
    expect(updatedUser.password).toEqual('87654321');
    expect(updatedUser.role).toEqual('admin');
  });

  it('should perform delete user correctly', async () => {
    const deletedId = utilities.insertedId[0];
    utilities.insertedId.slice(0, 1);

    const deletedUser = await User.findOneAndDelete(
      {
        _id: deletedId,
      },
      {
        _id: 1,
      },
    );

    expect(deletedUser._id).toEqual(deletedId);
  });
});
