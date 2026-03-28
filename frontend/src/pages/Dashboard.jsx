import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getTransactions, createTransaction, deleteTransaction, getStats,
  getWeeklyReport, getMonthlyReport,
} from '../services/api';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import StatsCard from '../components/StatsCard';
import CategoryChart from '../components/CategoryChart';
import WeeklyReport from '../components/WeeklyReport';
import MonthlyReport from '../components/MonthlyReport';

// ─── Helpers ───────────────────────────────────────────────────────────────
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date) {
  return date.toISOString().split('T')[0];
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core data
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Chart toggle
  const [chartTab, setChartTab] = useState('expenses');

  // Report panel
  const [reportTab, setReportTab] = useState('weekly');

  // Week navigation: anchor = a Date in the target week
  const [weekAnchor, setWeekAnchor] = useState(() => getMonday(new Date()));
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [weekReportLoading, setWeekReportLoading] = useState(false);

  // Month navigation
  const today = new Date();
  const [monthRef, setMonthRef] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthReportLoading, setMonthReportLoading] = useState(false);

  // ── Fetch all base data ──
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

  // ── Fetch weekly report ──
  const fetchWeekly = useCallback(async (anchor) => {
    setWeekReportLoading(true);
    try {
      const { data } = await getWeeklyReport(toISODate(anchor));
      setWeeklyReport(data);
    } catch {
      setWeeklyReport(null);
    } finally {
      setWeekReportLoading(false);
    }
  }, []);

  // ── Fetch monthly report ──
  const fetchMonthly = useCallback(async ({ year, month }) => {
    setMonthReportLoading(true);
    try {
      const { data } = await getMonthlyReport(year, month);
      setMonthlyReport(data);
    } catch {
      setMonthlyReport(null);
    } finally {
      setMonthReportLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchWeekly(weekAnchor); }, [weekAnchor, fetchWeekly]);
  useEffect(() => { fetchMonthly(monthRef); }, [monthRef, fetchMonthly]);

  // ── Navigation ──
  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  };

  const prevMonth = () => {
    setMonthRef(({ year, month }) => {
      if (month === 1) return { year: year - 1, month: 12 };
      return { year, month: month - 1 };
    });
  };
  const nextMonth = () => {
    setMonthRef(({ year, month }) => {
      if (month === 12) return { year: year + 1, month: 1 };
      return { year, month: month + 1 };
    });
  };

  // ── Period label for nav bar ──
  const weekLabel = weeklyReport?.period ?? '…';
  const monthLabel = monthlyReport?.period ?? new Date(monthRef.year, monthRef.month - 1, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  // ── Handlers ──
  const handleAddTransaction = async (formData) => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await createTransaction(formData);
      setTransactions((prev) => [data, ...prev]);
      await Promise.all([fetchData(), fetchWeekly(weekAnchor), fetchMonthly(monthRef)]);
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
      await Promise.all([fetchData(), fetchWeekly(weekAnchor), fetchMonthly(monthRef)]);
    } catch {
      setError('Failed to delete transaction.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Shared tab button style ──
  const tabBtn = (active) =>
    `px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      active
        ? 'bg-primary-600/30 text-primary-300 border border-primary-500/40'
        : 'text-gray-400 hover:text-gray-200'
    }`;

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
            <span className="text-sm text-gray-400 hidden sm:block">👋 {user?.name}</span>
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
            {/* ── Stats Cards ── */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard label="Total Income" value={`$${stats.totalIncome.toFixed(2)}`} icon="💰" color="emerald" />
                <StatsCard label="Total Expenses" value={`$${stats.totalExpenses.toFixed(2)}`} icon="📊" color="red" />
                <StatsCard
                  label="Net Balance"
                  value={`$${stats.balance.toFixed(2)}`}
                  icon="💎"
                  color={stats.balance >= 0 ? 'emerald' : 'red'}
                />
                <StatsCard label="Anomalies Detected" value={stats.anomalyCount} icon="🚨" color="amber" />
              </div>
            )}

            {/* ── Form + Category Chart (with toggle) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1">
                <TransactionForm onSubmit={handleAddTransaction} loading={submitting} />
              </div>

              {/* Category chart card with Expenses/Income toggle */}
              <div className="lg:col-span-2">
                <div className="card h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="text-lg">📈</span> Category Breakdown
                    </h3>
                    <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
                      <button className={tabBtn(chartTab === 'expenses')} onClick={() => setChartTab('expenses')}>
                        Expenses
                      </button>
                      <button className={tabBtn(chartTab === 'income')} onClick={() => setChartTab('income')}>
                        Income
                      </button>
                    </div>
                  </div>

                  {chartTab === 'expenses' && stats?.expenseByCategory && (
                    <CategoryChart data={stats.expenseByCategory} title="" compact />
                  )}
                  {chartTab === 'income' && stats?.incomeByCategory && Object.keys(stats.incomeByCategory).length > 0 && (
                    <CategoryChart data={stats.incomeByCategory} title="" compact />
                  )}
                  {chartTab === 'income' && (!stats?.incomeByCategory || Object.keys(stats.incomeByCategory).length === 0) && (
                    <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
                      No income data yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Transaction Log (with filter tabs inside) ── */}
            <div className="mb-8">
              <TransactionTable transactions={transactions} onDelete={handleDelete} />
            </div>

            {/* ── Reports Panel ── */}
            <div className="card">
              {/* Header: Weekly/Monthly tabs + period navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h2 className="text-base font-semibold text-white">Reports</h2>
                  <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1 ml-2">
                    <button className={tabBtn(reportTab === 'weekly')} onClick={() => setReportTab('weekly')}>
                      Weekly
                    </button>
                    <button className={tabBtn(reportTab === 'monthly')} onClick={() => setReportTab('monthly')}>
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Period navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={reportTab === 'weekly' ? prevWeek : prevMonth}
                    className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-300 hover:text-white transition-all"
                    title="Previous period"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-300 min-w-[180px] text-center font-medium">
                    {reportTab === 'weekly' ? weekLabel : monthLabel}
                  </span>
                  <button
                    onClick={reportTab === 'weekly' ? nextWeek : nextMonth}
                    className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-600 text-gray-300 hover:text-white transition-all"
                    title="Next period"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Report content */}
              {reportTab === 'weekly' && (
                weekReportLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <WeeklyReport report={weeklyReport} />
                )
              )}
              {reportTab === 'monthly' && (
                monthReportLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <MonthlyReport report={monthlyReport} />
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
