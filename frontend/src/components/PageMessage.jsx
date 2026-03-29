export default function PageMessage({ title, description, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-700 bg-slate-900/80 text-slate-200",
    danger: "border-rose-900/40 bg-rose-950/40 text-rose-200",
  };

  return (
    <div className={`rounded-3xl border p-5 ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      {description ? <p className="mt-2 text-sm opacity-90">{description}</p> : null}
    </div>
  );
}
