import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReminders } from "../hooks/useReminders";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const ReminderGroup = ({ title, leads, color, onSelect }) => {
  if (leads.length === 0) return null;

  return (
    <div>
      <p className={`px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide ${color}`}>
        {title} ({leads.length})
      </p>
      <ul>
        {leads.map((lead) => (
          <li key={lead._id}>
            <Link
              to={`/leads/${lead._id}`}
              onClick={onSelect}
              className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{lead.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {lead.company || "No company"} · {lead.stage}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">📅 {formatDate(lead.followUpDate)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function NotificationBell() {
  const { data } = useReminders();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Bahar click karne par dropdown band
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const overdue = data?.overdue || [];
  const today = data?.today || [];
  const count = data?.count || 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-xl text-slate-600 hover:bg-slate-100"
        aria-label="Follow-up reminders"
      >
        🔔
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Follow-up reminders</p>
          </div>

          <div className="max-h-96 overflow-y-auto pb-2">
            {count === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                You&apos;re all caught up! 🎉
                <span className="mt-1 block text-xs text-slate-400">
                  Reminders appear for leads assigned to you.
                </span>
              </p>
            ) : (
              <>
                <ReminderGroup title="Overdue" leads={overdue} color="text-red-600" onSelect={() => setOpen(false)} />
                <ReminderGroup
                  title="Due today"
                  leads={today}
                  color="text-amber-600"
                  onSelect={() => setOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
