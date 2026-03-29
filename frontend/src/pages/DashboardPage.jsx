import { ArrowRight, Brain, Clock3, Flame, Rocket, ShieldAlert, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";
import PageMessage from "../components/PageMessage";
import StatCard from "../components/StatCard";
import TopicPill from "../components/TopicPill";
import { minutes, percent } from "../utils/formatters";

const quickActions = [
  {
    title: "Ask The Tutor",
    description: "Turn confusion into a guided explanation with context-aware help.",
    to: "/chat",
    icon: Brain,
    tone: "from-teal-500/15 to-white",
  },
  {
    title: "Run A Quiz Sprint",
    description: "Generate adaptive practice that targets your current topic gaps.",
    to: "/quiz",
    icon: Rocket,
    tone: "from-rose-500/15 to-white",
  },
  {
    title: "View Today’s Plan",
    description: "See the study blocks built from your weakest areas and recent performance.",
    to: "/study-plan",
    icon: Flame,
    tone: "from-amber-400/20 to-white",
  },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await api.get("/dashboard");
        if (active) {
          setData(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.detail || "Unable to load dashboard right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const averageAccuracy =
    data?.topic_strength?.length
      ? data.topic_strength.reduce((sum, item) => sum + item.accuracy, 0) / data.topic_strength.length
      : 0;
  const averageTime =
    data?.topic_strength?.length
      ? data.topic_strength.reduce((sum, item) => sum + item.avg_time, 0) / data.topic_strength.length
      : 0;
  const strongestTopic = data?.strong_topics?.[0] || "No strong topic yet";
  const weakestTopic = data?.weak_topics?.[0] || "All topics are balanced";
  const recentCount = data?.recent_activity?.length || 0;

  if (loading) {
    return <PageMessage title="Loading dashboard" description="Pulling your latest topic strength and progress insights." />;
  }

  if (error) {
    return <PageMessage title="Dashboard unavailable" description={error} tone="danger" />;
  }

  return (
    <div className="space-y-6">
      <section className="panel-dark soft-grid relative overflow-hidden rounded-[2rem] px-6 py-7 text-white shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-rose-300/10 blur-2xl" />
        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">Session Snapshot</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight">
              Your study twin is ready with the next best move.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/90">
              You are strongest in <span className="font-semibold text-white">{strongestTopic}</span> and the current
              focus area is <span className="font-semibold text-white">{weakestTopic}</span>. Keep the loop tight:
              explain, practice, review, repeat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {(data?.strong_topics?.slice(0, 2) || []).map((topic) => (
                <span key={topic} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  Winning: {topic}
                </span>
              ))}
              {(data?.weak_topics?.slice(0, 2) || []).map((topic) => (
                <span key={topic} className="rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-100">
                  Focus: {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3 text-teal-100">
                <Trophy size={18} />
                <p className="text-sm font-semibold">Average Accuracy</p>
              </div>
              <p className="mt-4 font-display text-4xl font-bold">{percent(averageAccuracy)}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3 text-amber-100">
                <Clock3 size={18} />
                <p className="text-sm font-semibold">Question Pace</p>
              </div>
              <p className="mt-4 font-display text-4xl font-bold">{minutes(averageTime)}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3 text-rose-100">
                <ShieldAlert size={18} />
                <p className="text-sm font-semibold">Recent Sessions</p>
              </div>
              <p className="mt-4 font-display text-4xl font-bold">{recentCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Average Accuracy"
          value={percent(averageAccuracy)}
          hint="Built from all tracked quiz attempts"
          tone="primary"
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Avg. Time Per Question"
          value={minutes(averageTime)}
          hint="Used to keep future practice balanced"
          tone="warm"
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Weak Topics"
          value={data?.weak_topics?.length || 0}
          hint="These get priority in plans and adaptive practice"
          tone="accent"
          icon={<ShieldAlert size={18} />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {quickActions.map(({ title, description, to, icon: Icon, tone }) => (
          <Link
            key={title}
            to={to}
            className={`glass-card group overflow-hidden bg-gradient-to-br p-5 transition hover:-translate-y-1 ${tone}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-slate-800/90 p-3 text-slate-100 shadow-sm">
                <Icon size={18} />
              </div>
              <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-100" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Progress trend</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Accuracy over time</h2>
            </div>
            <div className="rounded-2xl bg-teal-500/12 px-4 py-2 text-sm font-semibold text-teal-200">Momentum view</div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.accuracy_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Topic balance</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">Strength map</h2>
            </div>
            <div className="rounded-2xl bg-sky-500/12 px-4 py-2 text-sm font-semibold text-sky-200">Adaptive lens</div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topic_strength || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Strong and weak topics</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-teal-900/50 bg-teal-950/30 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-800 p-2 text-teal-200 shadow-sm">
                  <Trophy size={16} />
                </div>
                <p className="text-sm font-semibold text-teal-100">Strong topics</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(data?.strong_topics || []).length ? (
                  data.strong_topics.map((topic) => <TopicPill key={topic} text={topic} tone="primary" />)
                ) : (
                  <p className="text-sm text-teal-100/80">Complete a few quizzes to surface strengths.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-sky-900/50 bg-sky-950/25 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-800 p-2 text-sky-200 shadow-sm">
                  <ShieldAlert size={16} />
                </div>
                <p className="text-sm font-semibold text-sky-100">Weak topics</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(data?.weak_topics || []).length ? (
                  data.weak_topics.map((topic) => <TopicPill key={topic} text={topic} tone="danger" />)
                ) : (
                  <p className="text-sm text-sky-100/80">No weak topic is standing out right now.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Recent activity</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Latest quiz and doubt interactions</h2>
          <div className="mt-6 space-y-4">
            {(data?.recent_activity || []).length ? (
              data.recent_activity.map((item, index) => (
                <div key={`${item.topic}-${index}`} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.topic}</p>
                      <p className="text-sm text-slate-400">{item.subject}</p>
                    </div>
                    <TopicPill text={item.correct ? "Correct" : "Needs review"} tone={item.correct ? "primary" : "warm"} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <Clock3 size={14} />
                    Time taken: {minutes(item.time_taken)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
                No recent activity yet. Start with a tutor question or one adaptive quiz.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
