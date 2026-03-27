import { useState, useEffect } from 'react';
import axios from 'axios';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Travel', 'Office', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Sales', 'Investment', 'Other'];

export default function TransactionForm({ onSubmit, loading }) {
  const [type, setType] = useState('Expense');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });

  const handleTypeChange = (newType) => {
    setType(newType);
    setForm(prev => ({
      ...prev,
      category: newType === 'Income' ? 'Salary' : 'Food'
    }));
  };

  // Debounced API call to our NLP model
  useEffect(() => {
    const desc = form.description;
    if (desc.length < 3) return;

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || '/api'}/transactions/predict-category?desc=${encodeURIComponent(desc)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const prediction = res.data;
        if (prediction && prediction.type && prediction.category) {
          if (prediction.type !== type) {
            setType(prediction.type);
          }
          setForm((prev) => ({ ...prev, category: prediction.category }));
        }
      } catch (err) {
        console.error('Failed to predict category:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.description]); // Re-run effect whenever description changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawAmount = Number(form.amount);
    // Standardize amount: expenses are negative, incomes are positive
    const finalAmount = type === 'Expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    onSubmit({ ...form, amount: finalAmount });
    
    setForm({ 
      description: '', 
      amount: '', 
      category: type === 'Income' ? 'Salary' : 'Food', 
      date: new Date().toISOString().split('T')[0] 
    });
  };

  const currentCategories = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="card h-fit">
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <span className="text-xl">➕</span> Add Transaction
      </h2>

      {/* Type Toggle */}
      <div className="flex bg-dark-700 p-1 rounded-xl mb-6">
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'Expense' ? 'bg-dark-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => handleTypeChange('Expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${type === 'Income' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => handleTypeChange('Income')}
        >
          Income
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="description">
            Description <span className="ml-1 text-xs text-primary-400">(Auto-predicts category)</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            className="input-field"
            placeholder="e.g. Pathao ride..."
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="input-field"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            required
            className="input-field"
            value={form.category}
            onChange={handleChange}
          >
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="input-field"
            value={form.date}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Add ${type}`
          )}
        </button>
      </form>
    </div>
  );
}
