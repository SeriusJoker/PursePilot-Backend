const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getTransactions, addTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');

const router = express.Router();

// CRUD Routes
router.get('/', authMiddleware, getTransactions); // Get all transactions (only if logged in)
router.post('/', authMiddleware, addTransaction); // Add a transaction (only if logged in)
router.put('/:id', authMiddleware, updateTransaction); // Update (only if logged in)
router.delete('/:id', authMiddleware, deleteTransaction); // Delete (only if logged in)

module.exports = router;
