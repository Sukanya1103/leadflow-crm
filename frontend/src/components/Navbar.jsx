import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import NotificationBell from "./NotificationBell";

const roleLabel = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
};

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-2xl text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3 md:gap-4">
        <NotificationBell />

        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {roleLabel[user?.role] || user?.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
