import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Travel', 'Office', 'Other'];

export default function TransactionForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: Number(form.amount) });
    setForm({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="card h-fit">
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <span className="text-xl">➕</span> Add Transaction
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            required
            className="input-field"
            placeholder="e.g. Team lunch"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="amount">
            Amount ($)
            <span className="ml-1 text-xs text-gray-500">positive = income, negative = expense</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            required
            className="input-field"
            placeholder="e.g. -49.99"
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
            {CATEGORIES.map((cat) => (
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
              Analyzing...
            </span>
          ) : (
            'Add Transaction'
          )}
        </button>
      </form>
    </div>
  );
}
