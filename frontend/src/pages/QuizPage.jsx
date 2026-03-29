import { useState } from "react";
import api from "../api/client";
import PageMessage from "../components/PageMessage";

export default function QuizPage() {
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("Kinematics");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function generateQuiz() {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/generate-quiz", {
        subject,
        topic,
        num_questions: 5,
      });
      setQuestions(data);
      setAnswers({});
      setResult(null);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not generate a quiz right now.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (questions.some((item) => !answers[item.id])) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    const payload = {
      answers: questions.map((item) => ({
        question: item.question,
        selected_answer: answers[item.id] || "",
        correct_answer: item.correct_answer,
        explanation: item.explanation,
        topic: item.topic,
        subject,
        time_taken: 2,
      })),
    };

    try {
      const { data } = await api.post("/submit-quiz", payload);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Quiz submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-sm font-semibold text-primary">Adaptive quiz generator</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Practice at the right difficulty</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <input className="field" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
          <button type="button" onClick={generateQuiz} disabled={loading} className="btn-primary">
            {loading ? "Creating..." : "Generate Quiz"}
          </button>
        </div>
        {error ? <div className="mt-4"><PageMessage title="Quiz action failed" description={error} tone="danger" /></div> : null}
      </section>

      {questions.length ? (
        <section className="space-y-4">
          {questions.map((item, index) => (
            <div key={item.id} className="glass-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">Question {index + 1}</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{item.question}</h2>
                </div>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">{item.difficulty}</span>
              </div>

              <div className="mt-5 grid gap-3">
                {item.options.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/55 px-4 py-3 text-slate-100">
                    <input
                      type="radio"
                      name={item.id}
                      checked={answers[item.id] === option}
                      onChange={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              {result ? (
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 text-sm text-slate-200">{item.explanation}</div>
              ) : null}
            </div>
          ))}

          <button type="button" onClick={submitQuiz} disabled={submitting} className="btn-primary w-full">
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </section>
      ) : null}

      {result ? (
        <section className="glass-card p-6">
          <p className="text-sm font-semibold text-primary">Quiz result</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">
            {result.score}/{result.total} correct
          </h2>
          <p className="mt-3 text-slate-300">Accuracy: {Math.round(result.accuracy)}%. Updated topics: {result.updated_topics.join(", ")}.</p>
        </section>
      ) : null}
    </div>
  );
}
