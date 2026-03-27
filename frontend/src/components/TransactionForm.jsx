import { useState } from 'react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Travel', 'Office', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Sales', 'Investment', 'Other'];

const predictCategoryInfo = (desc) => {
  const d = desc.toLowerCase();
  
  // Income 
  if (d.includes('salary') || d.includes('paycheck') || d.includes('wage')) return { type: 'Income', category: 'Salary' };
  if (d.includes('bonus') || d.includes('dividend')) return { type: 'Income', category: 'Bonus' };
  if (d.includes('freelance') || d.includes('client') || d.includes('sales') || d.includes('invoice')) return { type: 'Income', category: 'Sales' };
  if (d.includes('stock') || d.includes('investment') || d.includes('crypto')) return { type: 'Income', category: 'Investment' };
  
  // Expenses
  if (d.includes('uber') || d.includes('taxi') || d.includes('gas') || d.includes('train') || d.includes('bus') || d.includes('transit') || d.includes('lyft') || d.includes('flight')) return { type: 'Expense', category: 'Transport' };
  if (d.includes('lunch') || d.includes('dinner') || d.includes('food') || d.includes('restaurant') || d.includes('grocery') || d.includes('coffee') || d.includes('mcdonald') || d.includes('pizza')) return { type: 'Expense', category: 'Food' };
  if (d.includes('electric') || d.includes('water') || d.includes('internet') || d.includes('bill') || d.includes('phone') || d.includes('wifi')) return { type: 'Expense', category: 'Utilities' };
  if (d.includes('movie') || d.includes('game') || d.includes('concert') || d.includes('netflix') || d.includes('spotify') || d.includes('party')) return { type: 'Expense', category: 'Entertainment' };
  if (d.includes('doctor') || d.includes('pharmacy') || d.includes('medicine') || d.includes('gym') || d.includes('hospital')) return { type: 'Expense', category: 'Health' };
  if (d.includes('hotel') || d.includes('airbnb') || d.includes('vacation')) return { type: 'Expense', category: 'Travel' };
  if (d.includes('desk') || d.includes('paper') || d.includes('office') || d.includes('software') || d.includes('subscription')) return { type: 'Expense', category: 'Office' };
  
  return null;
};

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let updates = { [name]: value };
    
    // Auto-predict category & type based on description
    if (name === 'description' && value.length > 2) {
      const prediction = predictCategoryInfo(value);
      if (prediction) {
        if (prediction.type !== type) {
          setType(prediction.type);
        }
        updates.category = prediction.category;
      }
    }
    
    setForm(prev => ({ ...prev, ...updates }));
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
            placeholder="e.g. Uber to work..."
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
