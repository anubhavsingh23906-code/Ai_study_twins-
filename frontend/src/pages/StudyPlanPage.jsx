import { useEffect, useState } from "react";
import api from "../api/client";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    api.get("/study-plan").then((response) => setPlan(response.data));
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">Daily study planner</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">AI-generated plan for today</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          {plan?.summary || "Your study plan will appear here after the AI reviews your current weak topics."}
        </p>
      </section>

      <section className="grid gap-4">
        {(plan?.plan || []).map((item) => (
          <article key={`${item.title}-${item.focus}`} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">{item.focus}</p>
                <h2 className="mt-2 text-xl font-bold text-ink">{item.title}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">{item.duration_minutes} mins</span>
            </div>
            <p className="mt-4 text-slate-600">{item.action}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
