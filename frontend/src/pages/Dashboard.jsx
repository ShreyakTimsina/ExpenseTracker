import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTransactions, createTransaction, deleteTransaction, getStats } from '../services/api';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import StatsCard from '../components/StatsCard';
import CategoryChart from '../components/CategoryChart';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [txRes, statsRes] = await Promise.all([getTransactions(), getStats()]);
      setTransactions(txRes.data);
      setStats(statsRes.data);
    } catch {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (formData) => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await createTransaction(formData);
      setTransactions((prev) => [data, ...prev]);
      await fetchData();
      if (data.isAnomaly) {
        setSuccess('⚠️ Transaction added — flagged as anomaly (unusually high for this category)!');
      } else {
        setSuccess('✅ Transaction added successfully!');
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      await fetchData();
    } catch {
      setError('Failed to delete transaction.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <nav className="border-b border-dark-600 bg-dark-800/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg">ExpenseIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">
              👋 {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white border border-dark-600 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Track and analyze your business expenses</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                  label="Total Income"
                  value={`$${stats.totalIncome.toFixed(2)}`}
                  icon="💰"
                  color="emerald"
                />
                <StatsCard
                  label="Total Expenses"
                  value={`$${stats.totalExpenses.toFixed(2)}`}
                  icon="📊"
                  color="red"
                />
                <StatsCard
                  label="Net Balance"
                  value={`$${stats.balance.toFixed(2)}`}
                  icon="💎"
                  color={stats.balance >= 0 ? 'emerald' : 'red'}
                />
                <StatsCard
                  label="Anomalies Detected"
                  value={stats.anomalyCount}
                  icon="🚨"
                  color="amber"
                />
              </div>
            )}

            {/* Two-column layout with 3 elements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Add Transaction Form */}
              <div className="lg:col-span-1">
                <TransactionForm onSubmit={handleAddTransaction} loading={submitting} />
              </div>

              {/* Category Breakdown Charts */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats?.expenseByCategory && (
                  <CategoryChart 
                    data={stats.expenseByCategory} 
                    title="Expenses by Category" 
                  />
                )}
                {stats?.incomeByCategory && Object.keys(stats.incomeByCategory).length > 0 && (
                  <CategoryChart 
                    data={stats.incomeByCategory} 
                    title="Income by Source" 
                  />
                )}
              </div>
            </div>

            {/* Transaction Table */}
            <TransactionTable transactions={transactions} onDelete={handleDelete} />
          </>
        )}
      </main>
    </div>
  );
}
