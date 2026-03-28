import { useState } from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expenses', label: 'Expenses' },
];

export default function TransactionTable({ transactions, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter((t) => {
    if (filter === 'income') return t.amount > 0;
    if (filter === 'expenses') return t.amount < 0;
    return true;
  });

  return (
    <div className="card overflow-hidden !p-0">
      {/* Header with filter tabs */}
      <div className="p-4 border-b border-dark-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="text-xl">📋</span> Transaction Log
        </h2>
        <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === key
                  ? 'bg-primary-600/30 text-primary-300 border border-primary-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-dark-800 border-b border-dark-600">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Date</th>
              <th scope="col" className="px-6 py-4 font-medium">Description</th>
              <th scope="col" className="px-6 py-4 font-medium">Category</th>
              <th scope="col" className="px-6 py-4 font-medium">Amount</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl mb-2">🍃</span>
                    <p>No {filter === 'all' ? '' : filter + ' '}transactions found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t._id} className="bg-dark-900 border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    {t.description}
                    {t.isAnomaly && (
                      <span className="badge-anomaly ml-2" title="Anomaly detected - unusually high amount for this category!">
                        ⚠️ Warning
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-dark-700 rounded-lg text-gray-300 border border-dark-600">
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete(t._id)}
                      className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
