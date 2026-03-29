import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import { useAuth } from "./hooks/useAuth";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const StudyPlanPage = lazy(() => import("./pages/StudyPlanPage"));

function ShellRoute({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ShellRoute>
            <DashboardPage />
          </ShellRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ShellRoute>
            <ChatPage />
          </ShellRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ShellRoute>
            <QuizPage />
          </ShellRoute>
        }
      />
      <Route
        path="/study-plan"
        element={
          <ShellRoute>
            <StudyPlanPage />
          </ShellRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading AI Study Twin...</div>}>
      <AppRoutes />
    </Suspense>
  );
}
