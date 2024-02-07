require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../carts');

describe('Database Cart Model test', () => {
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
      await Cart.deleteMany({
        _id: utilities.insertedId,
      });
      await mongoose.disconnect();
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  it('should cannot create cart when given invalid user id', async () => {
    const insertedCart = {
      userId: 1,
      items: [
        {
          productId: 1,
          amount: 2,
          subtotal: 15000,
        },
        {
          productId: 2,
          amount: 2,
          subtotal: 60000,
        },
      ],
    };

    try {
      const newCart = new Cart(insertedCart);
      await newCart.save();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should perform create and return cart correctly', async () => {
    const insertedCart = [
      {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 1,
            amount: 2,
            subtotal: 15000,
          },
          {
            productId: 2,
            amount: 2,
            subtotal: 60000,
          },
        ],
      },
      {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 3,
            amount: 1,
            subtotal: 20000,
          },
          {
            productId: 2,
            amount: 1,
            subtotal: 30000,
          },
        ],
      },
    ];

    await Promise.all(
      insertedCart.map(async (cart) => {
        const newCart = new Cart(cart);
        utilities.insertedId.push(newCart._id);
        await newCart.save();
      }),
    );

    const cart = await Cart.findOne({
      _id: utilities.insertedId[0],
    });

    const expectedInsertedCart = insertedCart[0];

    expect(cart.userId).toEqual(expectedInsertedCart.userId);
    expect(cart.items).toHaveLength(2);
    expect(cart.items[0].productId).toEqual(expectedInsertedCart.items[0].productId);
    expect(cart.items[0].amount).toEqual(expectedInsertedCart.items[0].amount);
  });

  it('should perform put cart correctly', async () => {
    const updatedCartPayload = {
      items: [
        {
          productId: 1,
          amount: 1,
          subtotal: 7500,
        },
      ],
    };

    await Cart.updateOne({
      _id: utilities.insertedId[0],
    }, updatedCartPayload);

    const updatedCart = await Cart.findOne({
      _id: utilities.insertedId[0],
    });

    expect(updatedCart.items[0].productId).toEqual(updatedCartPayload.items[0].productId);
    expect(updatedCart.items[0].amount).toEqual(updatedCartPayload.items[0].amount);
    expect(updatedCart.items[0].subtotal).toEqual(updatedCartPayload.items[0].subtotal);
  });
});
