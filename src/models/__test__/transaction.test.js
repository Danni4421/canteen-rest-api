require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../transaction');

describe('Database Transaction Model test', () => {
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
      await Transaction.deleteMany({
        _id: {
          $in: utilities.insertedId,
        },
      });
      await mongoose.disconnect();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('should perform create and return product correctly', async () => {
    const insertedTransaction = [
      {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 1,
            amount: 1,
            subtotal: 15000,
          },
        ],
        status: 'process',
      },
      {
        userId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: 2,
            amount: 1,
            subtotal: 20000,
          },
          {
            productId: 3,
            amount: 2,
            subtotal: 30000,
          },
        ],
        status: 'decline',
      },
    ];

    await Promise.all(
      insertedTransaction.map(async (transaction) => {
        const newTransaction = new Transaction(transaction);
        utilities.insertedId.push(newTransaction._id);
        await newTransaction.save();
      }),
    );

    const transaction = await Transaction.findById({
      _id: utilities.insertedId[0],
    });

    expect(transaction.userId).toEqual(insertedTransaction[0].userId);
    expect(transaction.items).toHaveLength(1);
    expect(transaction.items[0].productId).toEqual(insertedTransaction[0].items[0].productId);
    expect(transaction.items[0].amount).toEqual(insertedTransaction[0].items[0].amount);
    expect(transaction.items[0].subtotal).toEqual(insertedTransaction[0].items[0].subtotal);
    expect(transaction.status).toEqual('process');
  });

  it('should perform edit transaction and return edited transaction correctly', async () => {
    const updatedTransaction = await Transaction.findOneAndUpdate({
      _id: utilities.insertedId[0],
    }, {
      $set: {
        status: 'done',
      },
    }, {
      new: true,
    });

    expect(updatedTransaction.status).toEqual('done');
  });

  it('should perform delete transaction and return deleted transaction correctly', async () => {
    const deletedTransactionId = utilities.insertedId[0];
    utilities.insertedId.slice(0, 1);
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: deletedTransactionId,
    });

    expect(deletedTransaction._id).toEqual(deletedTransactionId);
  });
});
