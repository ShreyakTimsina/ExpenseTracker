import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#6366f1', // primary-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
  '#84cc16', // lime-500
];

export default function CategoryChart({ data, title = "Expenses by Category" }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="card h-full flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-gray-400 text-center">No expense data available for chart</p>
      </div>
    );
  }

  return (
    <div className="card h-full min-h-[350px] flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#1e1e38', borderColor: '#2d2d50', borderRadius: '0.75rem', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
