import { useEffect, useState } from "react";
import api from "../api/client";
import PageMessage from "../components/PageMessage";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      try {
        const response = await api.get("/study-plan");
        if (active) {
          setPlan(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.detail || "Unable to load your study plan right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <PageMessage title="Building your study plan" description="Reviewing weak topics and preparing your day." />;
  }

  if (error) {
    return <PageMessage title="Study plan unavailable" description={error} tone="danger" />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">Daily study planner</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">AI-generated plan for today</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          {plan?.summary || "Your study plan will appear here after the AI reviews your current weak topics."}
        </p>
      </section>

      <section className="grid gap-4">
        {(plan?.plan || []).map((item) => (
          <article key={`${item.title}-${item.focus}`} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">{item.focus}</p>
                <h2 className="mt-2 text-xl font-bold text-white">{item.title}</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">{item.duration_minutes} mins</span>
            </div>
            <p className="mt-4 text-slate-300">{item.action}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
