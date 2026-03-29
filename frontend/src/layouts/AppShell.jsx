import { BookOpen, BrainCircuit, ChevronRight, LayoutDashboard, LogOut, NotebookPen, Sparkles, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Chat", icon: BrainCircuit },
  { to: "/quiz", label: "Adaptive Quiz", icon: BookOpen },
  { to: "/study-plan", label: "Study Plan", icon: NotebookPen },
];

export default function AppShell({ children }) {
  const { profile, logout } = useAuth();

  return (
    <div className="dashboard-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="glass-card fade-in-up w-full p-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-80">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">AI Study Twin</p>
            <h1 className="mt-4 font-display text-3xl font-bold text-white">Your personal tutor cockpit</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Move between doubt solving, adaptive practice, and daily planning without losing context.
            </p>
          </div>

          <div className="panel-dark soft-grid mt-8 rounded-[2rem] px-5 py-5 text-white shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Student profile</p>
                <p className="mt-2 text-xl font-semibold">{profile?.name}</p>
                <p className="text-sm text-slate-300">
                  Class {profile?.student_class} | {profile?.exam_goal}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-teal-200">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Style</p>
                <p className="mt-2 text-sm font-semibold text-white">{profile?.preferred_learning_style || "Step-by-step"}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Subjects</p>
                <p className="mt-2 text-sm font-semibold text-white">{profile?.selected_subjects?.length || 0} active</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-700/70 bg-slate-800/60 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-300/15 p-2 text-amber-200">
                <Target size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Today&apos;s target</p>
                <p className="text-xs text-slate-300">Focus on one weak topic and one timed practice set.</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-teal-500/12 text-teal-200 shadow-sm ring-1 ring-teal-400/20"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </span>
                <ChevronRight size={16} className="opacity-60" />
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={logout} className="btn-secondary mt-8 w-full gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="fade-in-up flex-1">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-slate-700/60 bg-slate-900/55 px-6 py-5 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Live Learning Workspace</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">Make this session count</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review your weak spots, ask for guided explanations, and turn each interaction into measurable progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(profile?.selected_subjects || []).slice(0, 3).map((subject) => (
                <span key={subject} className="rounded-full border border-slate-700 bg-slate-800/85 px-4 py-2 text-sm font-semibold text-slate-200">
                  {subject}
                </span>
              ))}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
