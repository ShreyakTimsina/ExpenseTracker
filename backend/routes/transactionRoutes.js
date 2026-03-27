const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');
const { detectAnomaly } = require('../utils/anomalyDetection');
const { predictTransactionInfo } = require('../utils/mlCategorizer');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/transactions - Get all transactions for current user
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/transactions/predict-category - NLP text prediction
router.get('/predict-category', (req, res) => {
  try {
    const { desc } = req.query;
    const prediction = predictTransactionInfo(desc);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/transactions - Create a new transaction with anomaly detection
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !description) {
      return res.status(400).json({ message: 'Amount, category, and description are required' });
    }

    // 1. Query past transactions in the same category for this user
    const pastTransactions = await Transaction.find({
      userId: req.user.id,
      category,
    });

    // 2. Extract amounts for statistical analysis
    const historicalAmounts = pastTransactions.map((t) => t.amount);

    // 3 & 4. Detect anomaly (auto-bypasses if < 5 past transactions)
    const isAnomaly = detectAnomaly(historicalAmounts, Number(amount));

    // 5. Save transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: Number(amount),
      category,
      description,
      date: date || Date.now(),
      isAnomaly,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/transactions/stats - Get summary stats
router.get('/stats', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const anomalyCount = transactions.filter((t) => t.isAnomaly).length;

    const incomeByCategory = transactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const expenseByCategory = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    res.json({
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      anomalyCount,
      incomeByCategory,
      expenseByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
