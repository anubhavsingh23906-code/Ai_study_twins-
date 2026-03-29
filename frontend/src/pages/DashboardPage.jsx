import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import api from "../api/client";
import StatCard from "../components/StatCard";
import TopicPill from "../components/TopicPill";
import { minutes, percent } from "../utils/formatters";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((response) => setData(response.data));
  }, []);

  const averageAccuracy =
    data?.topic_strength?.length
      ? data.topic_strength.reduce((sum, item) => sum + item.accuracy, 0) / data.topic_strength.length
      : 0;
  const averageTime =
    data?.topic_strength?.length
      ? data.topic_strength.reduce((sum, item) => sum + item.avg_time, 0) / data.topic_strength.length
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Average Accuracy" value={percent(averageAccuracy)} hint="Based on completed quiz attempts" />
        <StatCard label="Avg. Time Per Question" value={minutes(averageTime)} hint="Used to adapt future quizzes" />
        <StatCard label="Weak Topics" value={data?.weak_topics?.length || 0} hint="Daily plan prioritizes these next" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Progress trend</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Accuracy over time</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.accuracy_trend || []}>
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Topic balance</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Strength map</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topic_strength || []}>
                <XAxis dataKey="topic" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#fb7185" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Adaptive focus</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Strong and weak topics</h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-500">Strong topics</p>
              <div className="flex flex-wrap gap-2">
                {(data?.strong_topics || []).map((topic) => (
                  <TopicPill key={topic} text={topic} tone="primary" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-500">Weak topics</p>
              <div className="flex flex-wrap gap-2">
                {(data?.weak_topics || []).map((topic) => (
                  <TopicPill key={topic} text={topic} tone="danger" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Recent activity</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">Latest quiz and doubt interactions</h2>
          <div className="mt-6 space-y-4">
            {(data?.recent_activity || []).map((item, index) => (
              <div key={`${item.topic}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{item.topic}</p>
                    <p className="text-sm text-slate-500">{item.subject}</p>
                  </div>
                  <TopicPill text={item.correct ? "Correct" : "Needs review"} tone={item.correct ? "primary" : "warm"} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Time taken: {minutes(item.time_taken)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
