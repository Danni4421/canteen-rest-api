require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../product');

describe('Database Product Model test', () => {
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
      await Product.deleteMany({
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
    const insertedProducts = [
      {
        _id: 1,
        name: 'Nutriboost Mangga',
        price: 7000,
        amount: 5,
        images: ['nutriboost.jpg', 'nutriboost2.png'],
      },
      {
        _id: 2,
        name: 'Makaroni Pedas',
        price: 500,
        amount: 20,
        images: ['makaroni.png'],
      },
      {
        _id: 3,
        name: 'Mini Pizza',
        price: 8000,
        amount: 5,
        images: ['minipizza.png'],
      },
    ];

    await Promise.all(
      insertedProducts.map(async (product) => {
        const newProduct = new Product(product);
        utilities.insertedId.push(newProduct._id);
        await newProduct.save();
      }),
    );

    const product = await Product.findById({
      _id: utilities.insertedId[0],
    });

    expect(product._id).toEqual(utilities.insertedId[0]);
    expect(product.name).toEqual('Nutriboost Mangga');
    expect(product.price).toEqual(7000);
    expect(product.amount).toEqual(5);
    expect(product.images).toHaveLength(2);
  });

  it('should perform edit product and return edited product correctly', async () => {
    const mockReplacedProductDetail = {
      name: 'Nutriboost Leci',
      price: 7000,
      amount: 10,
      images: ['nutriboostleci.jpg'],
    };

    await Product.findOneAndReplace(
      {
        _id: utilities.insertedId[0],
      },
      mockReplacedProductDetail,
    );

    const updatedProduct = await Product.findById(utilities.insertedId[0]);

    expect(updatedProduct.name).toEqual(mockReplacedProductDetail.name);
    expect(updatedProduct.price).toEqual(mockReplacedProductDetail.price);
    expect(updatedProduct.amount).toEqual(mockReplacedProductDetail.amount);
    expect(updatedProduct.images).toHaveLength(1);
  });

  it('should perform delete product correctly', async () => {
    const deletedId = utilities.insertedId[0];
    utilities.insertedId.slice(0, 1);

    const deletedProduct = await Product.findOneAndDelete({
      _id: deletedId,
    }, {
      created_at: 0,
      updated_at: 0,
    });

    const product = await Product.findById(deletedId);
    expect(product).toBe(null);
    expect(deletedProduct._id).toEqual(deletedId);
  });
});
