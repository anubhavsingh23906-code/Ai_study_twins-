import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const subjectOptions = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];

const initialForm = {
  name: "",
  email: "",
  password: "",
  class: "",
  exam_goal: "",
  preferred_learning_style: "step-by-step",
  selected_subjects: ["Mathematics", "Physics"],
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "signup"
          ? form
          : {
              email: form.email,
              password: form.password,
            };
      await login(payload, mode);
      navigate("/");
    } catch (submitError) {
      setError(submitError.response?.data?.detail || "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSubject(subject) {
    setForm((current) => ({
      ...current,
      selected_subjects: current.selected_subjects.includes(subject)
        ? current.selected_subjects.filter((item) => item !== subject)
        : [...current.selected_subjects, subject],
    }));
  }

  return (
    <div className="min-h-screen bg-study-grid px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-ink p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">AI Study Twin</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl font-bold leading-tight">
            Turn every study session into a personalized coaching loop.
          </h1>
          <p className="mt-5 max-w-lg text-slate-300">
            Chat with an AI tutor, generate adaptive quizzes, track topic mastery, and follow daily plans built around your weak spots.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Context-aware doubt solving",
              "Adaptive quiz difficulty",
              "Daily study planning",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-8">
          <div className="flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-2xl px-4 py-3 ${mode === "login" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-2xl px-4 py-3 ${mode === "signup" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="field" placeholder="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
                  <input
                    className="field"
                    placeholder="Exam goal"
                    value={form.exam_goal}
                    onChange={(e) => setForm({ ...form, exam_goal: e.target.value })}
                  />
                </div>
                <select
                  className="field"
                  value={form.preferred_learning_style}
                  onChange={(e) => setForm({ ...form, preferred_learning_style: e.target.value })}
                >
                  <option value="step-by-step">Step-by-step</option>
                  <option value="conceptual">Conceptual</option>
                  <option value="examples-based">Examples-based</option>
                </select>
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Select subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {subjectOptions.map((subject) => (
                      <button
                        type="button"
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          form.selected_subjects.includes(subject)
                            ? "bg-teal-50 text-primary"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <input className="field" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input
              className="field"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Please wait..." : mode === "login" ? "Enter Dashboard" : "Create Account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
