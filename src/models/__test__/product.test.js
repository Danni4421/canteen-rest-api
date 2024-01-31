const mongoose = require('mongoose');
const Product = require('../product');

describe('Database Product Model test', () => {
  let utilities = {
    insertedId: [],
  };

  beforeAll(async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/kantin');
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
    let insertedProducts = [
      {
        name: 'Nutriboost Mangga',
        price: 7000,
        amount: 5,
        image: ['nutriboost.jpg', 'nutriboost2.png'],
      },
      {
        name: 'Makaroni Pedas',
        price: 500,
        amount: 20,
        image: ['makaroni.png'],
      },
      {
        name: 'Mini Pizza',
        price: 8000,
        amount: 5,
        image: ['minipizza.png'],
      },
    ];

    await Promise.all(
      insertedProducts.map(async (product) => {
        const newProduct = new Product(product);
        utilities.insertedId.push(newProduct._id);
        await newProduct.save();
      })
    );

    const product = await Product.findById({
      _id: utilities.insertedId[0],
    });

    expect(product._id).toEqual(utilities.insertedId[0]);
    expect(product.name).toEqual('Nutriboost Mangga');
    expect(product.price).toEqual(7000);
    expect(product.amount).toEqual(5);
    expect(product.image).toHaveLength(2);
  });

  it('should perform edit product and return edited product correctly', async () => {
    const mockReplacedProductDetail = {
      name: 'Nutriboost Leci',
      price: 7000,
      amount: 10,
      image: ['nutriboostleci.jpg'],
    };

    await Product.replaceOne(
      {
        _id: utilities.insertedId[0],
      },
      mockReplacedProductDetail
    );

    const updatedProduct = await Product.findById(utilities.insertedId[0]);

    expect(updatedProduct.name).toEqual(mockReplacedProductDetail.name);
    expect(updatedProduct.price).toEqual(mockReplacedProductDetail.price);
    expect(updatedProduct.amount).toEqual(mockReplacedProductDetail.amount);
    expect(updatedProduct.image).toHaveLength(1);
  });

  it('should perform delete product correctly', async () => {
    const deletedId = utilities.insertedId[0];
    utilities.insertedId.slice(0, 1);

    await Product.deleteOne({
      _id: deletedId,
    });

    const product = await Product.findById(deletedId);

    expect(product).toBe(null);
  });
});
