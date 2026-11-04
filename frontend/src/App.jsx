import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Leads from "./pages/Leads";
import DashboardLayout from "./components/DashboardLayout";
import Pipeline from "./pages/Pipeline";
import LeadDetail from "./pages/LeadDetail";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Reports from "./pages/Reports";

const FullScreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100">
    <p className="text-slate-500">Loading...</p>
  </div>
);

// Sirf logged-in users ke liye
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Login/Register: logged-in user ko dashboard par bhej do
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

// Temporary placeholder, asli dashboard aage banega
const DashboardPlaceholder = () => (
  <div>
    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
    <p className="mt-1 text-slate-500">Stats and charts will appear here.</p>
  </div>
);

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="team" element={<Team />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
