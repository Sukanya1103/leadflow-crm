export default function StatCard({ label, value, sub, icon, accent = "bg-indigo-100 text-indigo-600" }) {
  return (
    <div className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}>
        {icon}
      </div>
    </div>
  );
}
