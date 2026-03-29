const toneClasses = {
  primary: "from-teal-400/18 via-slate-900/85 to-slate-900/85",
  accent: "from-sky-400/18 via-slate-900/85 to-slate-900/85",
  warm: "from-amber-300/18 via-slate-900/85 to-slate-900/85",
  neutral: "from-slate-500/20 via-slate-900/85 to-slate-900/85",
};

export default function StatCard({ label, value, hint, tone = "neutral", icon }) {
  return (
    <div className={`glass-card relative overflow-hidden bg-gradient-to-br p-5 ${toneClasses[tone]}`}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          {icon ? <div className="rounded-2xl bg-slate-800/95 p-2 text-slate-100 shadow-sm">{icon}</div> : null}
        </div>
        <h3 className="mt-4 font-display text-3xl font-bold text-white">{value}</h3>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>
      </div>
    </div>
  );
}
