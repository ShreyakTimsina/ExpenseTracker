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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if the slice is large enough (e.g. > 5%) to avoid clutter
  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="13" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryChart({ data, title = "Expenses by Category", compact = false }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    const emptyState = (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-gray-400 text-center">No data available for chart</p>
      </div>
    );
    return compact ? emptyState : <div className="card h-full">{emptyState}</div>;
  }

  const chartContent = (
    <div className={`flex flex-col h-full ${compact ? 'min-h-[250px]' : 'min-h-[350px]'}`}>
      {!compact && <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>}
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={compact ? 80 : 100}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={2}
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

  return compact ? chartContent : <div className="card h-full">{chartContent}</div>;
}
