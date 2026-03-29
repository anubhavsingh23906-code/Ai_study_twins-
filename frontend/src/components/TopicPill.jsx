export default function TopicPill({ text, tone = "primary" }) {
  const tones = {
    primary: "border border-teal-900/70 bg-teal-950/70 text-teal-200",
    danger: "border border-rose-900/70 bg-rose-950/70 text-rose-200",
    warm: "border border-amber-900/70 bg-amber-950/50 text-amber-200",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${tones[tone]}`}>{text}</span>;
}
