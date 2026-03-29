export default function TopicPill({ text, tone = "primary" }) {
  const tones = {
    primary: "bg-teal-50 text-teal-700",
    danger: "bg-rose-50 text-rose-700",
    warm: "bg-amber-50 text-amber-700",
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{text}</span>;
}
