import { NavLink } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ALL_ROLES = ["admin", "manager", "sales_rep"];

const links = [
  { to: "/", label: "Dashboard", icon: "📊", end: true, roles: ALL_ROLES },
  { to: "/leads", label: "Leads", icon: "👥", roles: ALL_ROLES },
  { to: "/pipeline", label: "Pipeline", icon: "🧩", roles: ALL_ROLES },
  { to: "/reports", label: "Reports", icon: "📈", roles: ["admin", "manager"] },
  { to: "/team", label: "Team", icon: "🏢", roles: ["admin"] },
];

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore((state) => state.user);

  const visibleLinks = links.filter((link) => link.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-200 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6 text-xl font-bold text-white">
          <span className="text-indigo-400">Lead</span>Flow
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

