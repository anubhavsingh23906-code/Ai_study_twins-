export default function StatCard({ label, value, hint }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-3 font-display text-3xl font-bold text-ink">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}
