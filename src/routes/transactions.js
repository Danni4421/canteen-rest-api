const router = require('express').Router();
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const TransactionsHandler = require('../handlers/transactions');
const TransactionsService = require('../services/mongo/transactions/TransactionsService');
const TransactionValidator = require('../validator/transactions');
const { isAuthenticatedMiddleware } = require('../middlewares/authentication');

const transactionsHandler = new TransactionsHandler({
  transactionsService: new TransactionsService({
    product: Product,
    transaction: Transaction,
  }),
}, TransactionValidator);

router.post('/', isAuthenticatedMiddleware, transactionsHandler.postTransactionHandler);
router.get('/', isAuthenticatedMiddleware, transactionsHandler.getTransactionsHandler);
router.put('/:transactionId/complete', isAuthenticatedMiddleware, transactionsHandler.completeTransactionHandler);
router.put('/:transactionId/decline', isAuthenticatedMiddleware, transactionsHandler.declineTransactionHandler);
router.delete('/:transactionId', isAuthenticatedMiddleware, transactionsHandler.deleteTransactionHandler);

module.exports = router;
