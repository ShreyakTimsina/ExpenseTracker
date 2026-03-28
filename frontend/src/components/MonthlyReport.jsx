import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function MonthlyReport({ report }) {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <span className="text-3xl block mb-2">🗓️</span>
          <p className="text-sm">No transactions this month</p>
        </div>
      </div>
    );
  }

  const { totalIncome, totalExpenses, balance, topCategories, weeklyBreakdown } = report;
  const isPositive = balance >= 0;

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Income</p>
          <p className="text-sm font-bold text-emerald-400">+${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Expenses</p>
          <p className="text-sm font-bold text-red-400">-${totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`border rounded-xl p-3 ${isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <p className="text-xs text-gray-400 mb-0.5">Balance</p>
          <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart + categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Weekly Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyBreakdown} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {topCategories?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Top Spending</p>
            <div className="space-y-3">
              {topCategories.map((c) => {
                const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 truncate">{c.category}</span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">${c.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500/70 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
