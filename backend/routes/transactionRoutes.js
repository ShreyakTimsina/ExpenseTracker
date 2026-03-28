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


// Helper: get top N categories from transactions
function getTopCategories(transactions, n = 5) {
  const map = {};
  for (const t of transactions) {
    if (t.amount < 0) {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    }
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([category, amount]) => ({ category, amount }));
}

// GET /api/transactions/report/weekly?date=YYYY-MM-DD (optional, defaults to today)
router.get('/report/weekly', async (req, res) => {
  try {
    const anchor = req.query.date ? new Date(req.query.date) : new Date();
    // Find Monday of the anchor's week
    const day = anchor.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? -6 : 1 - day);
    const monday = new Date(anchor);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(anchor.getDate() + diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: monday, $lte: sunday },
    });

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyBreakdown = dayNames.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.toDateString() === d.toDateString();
      });
      return {
        day: name,
        income: dayTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
        expenses: dayTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
      };
    });

    res.json({
      period: `${monday.toLocaleDateString()} – ${sunday.toLocaleDateString()}`,
      monday: monday.toISOString(),
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories: getTopCategories(transactions),
      dailyBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/transactions/report/monthly?year=YYYY&month=M (1-indexed, optional)
router.get('/report/monthly', async (req, res) => {
  try {
    const now = new Date();
    const y = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    const m = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth(); // convert to 0-indexed
    const firstDay = new Date(y, m, 1, 0, 0, 0, 0);
    const lastDay = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: firstDay, $lte: lastDay },
    });

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    // Split month into up to 5 week buckets
    const weeks = [];
    let weekStart = new Date(firstDay);
    let weekNum = 1;
    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

      const weekTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= weekStart && td <= weekEnd;
      });
      weeks.push({
        week: `Wk ${weekNum}`,
        income: weekTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
        expenses: weekTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
      });
      weekStart.setDate(weekStart.getDate() + 7);
      weekNum++;
    }

    const monthName = new Date(y, m, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    res.json({
      period: monthName,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories: getTopCategories(transactions),
      weeklyBreakdown: weeks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

