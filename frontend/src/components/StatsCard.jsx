export default function StatsCard({ label, value, icon, color }) {
  const colorMap = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
  };

  const textMap = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`card border ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${textMap[color] || textMap.blue}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
