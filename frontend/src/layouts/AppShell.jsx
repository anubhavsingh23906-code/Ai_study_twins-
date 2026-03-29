import { BookOpen, BrainCircuit, LayoutDashboard, LogOut, NotebookPen } from "lucide-react";
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
    <div className="min-h-screen bg-study-grid">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="glass-card w-full p-6 lg:w-72">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">AI Study Twin</p>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">Your personal tutor dashboard</h1>
          </div>

          <div className="mt-8 rounded-3xl bg-ink px-5 py-4 text-white">
            <p className="text-sm text-slate-300">Student profile</p>
            <p className="mt-2 text-xl font-semibold">{profile?.name}</p>
            <p className="text-sm text-slate-300">
              Class {profile?.class} • {profile?.exam_goal}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "bg-teal-50 text-primary" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={logout} className="btn-secondary mt-8 w-full gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
