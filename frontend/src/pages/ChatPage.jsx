import { useState } from "react";
import api from "../api/client";
import PageMessage from "../components/PageMessage";

export default function ChatPage() {
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("Integration");
  const [question, setQuestion] = useState("Explain how to solve integral of x squared.");
  const [learningStyle, setLearningStyle] = useState("step-by-step");
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/ask-doubt", {
        subject,
        topic,
        question,
        learning_style: learningStyle,
      });
      setResponse(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The tutor could not answer right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileExplain(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please choose a file before asking for an explanation.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("topic", topic);
      formData.append("learning_style", learningStyle);
      formData.append("question", question || "Explain this file simply and clearly.");
      formData.append("file", selectedFile);

      const { data } = await api.post("/ask-doubt-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "The tutor could not explain the uploaded file right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">AI doubt solver</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Ask your tutor anything</h1>
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
        <div className="my-6 border-t border-slate-700" />
        <form className="space-y-4" onSubmit={handleFileExplain}>
          <label className="block text-sm font-semibold text-slate-200">Upload a study file</label>
          <input
            className="field"
            type="file"
            accept=".txt,.md,.csv,.json,.pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <p className="text-xs text-slate-400">
            Supported: txt, md, csv, json, pdf. Best for notes, summaries, and question sheets.
          </p>
          <button type="submit" className="btn-secondary w-full" disabled={loading}>
            {loading ? "Reading file..." : "Explain Uploaded File"}
          </button>
        </form>
        {error ? <div className="mt-4"><PageMessage title="Tutor request failed" description={error} tone="danger" /></div> : null}
      </section>

      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">Personalized explanation</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Tutor response</h2>
        <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-800/70 p-5">
          <p className="whitespace-pre-line text-slate-200">
            {response?.answer || "Your explanation will appear here once you ask a doubt."}
          </p>
        </div>
        <div className="mt-4 rounded-3xl border border-teal-900/40 bg-teal-950/25 p-5">
          <p className="text-sm font-semibold text-primary">Follow-up practice</p>
          <p className="mt-2 text-slate-200">{response?.suggested_follow_up || "AI will recommend your next step here."}</p>
        </div>
      </section>
    </div>
  );
}
