import { useState } from "react";
import api from "../api/client";

export default function ChatPage() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("Integration");
  const [question, setQuestion] = useState("Explain how to solve integral of x squared.");
  const [learningStyle, setLearningStyle] = useState("step-by-step");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk(event) {
    event.preventDefault();
    setLoading(true);
    const { data } = await api.post("/ask-doubt", {
      subject,
      topic,
      question,
      learning_style: learningStyle,
    });
    setResponse(data);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">AI doubt solver</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Ask your tutor anything</h1>
        <form className="mt-6 space-y-4" onSubmit={handleAsk}>
          <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <input className="field" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
          <select className="field" value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)}>
            <option value="step-by-step">Step-by-step</option>
            <option value="conceptual">Conceptual</option>
            <option value="examples-based">Examples-based</option>
          </select>
          <textarea
            className="field min-h-40"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your doubt here..."
          />
          <button type="submit" className="btn-primary w-full">
            {loading ? "Generating explanation..." : "Ask AI Tutor"}
          </button>
        </form>
      </section>

      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">Personalized explanation</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">Tutor response</h2>
        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="whitespace-pre-line text-slate-700">
            {response?.answer || "Your explanation will appear here once you ask a doubt."}
          </p>
        </div>
        <div className="mt-4 rounded-3xl border border-teal-100 bg-teal-50 p-5">
          <p className="text-sm font-semibold text-primary">Follow-up practice</p>
          <p className="mt-2 text-slate-700">{response?.suggested_follow_up || "AI will recommend your next step here."}</p>
        </div>
      </section>
    </div>
  );
}
