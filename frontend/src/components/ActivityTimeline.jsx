import { useState } from "react";
import useAuthStore from "../store/authStore";
import {
  ACTIVITY_TYPES,
  useAddActivity,
  useDeleteActivity,
  useLeadActivities,
} from "../hooks/useLeadDetail";

const typeStyles = {
  call: { icon: "📞", label: "Call", color: "bg-blue-100 text-blue-700" },
  email: { icon: "✉️", label: "Email", color: "bg-purple-100 text-purple-700" },
  meeting: { icon: "🤝", label: "Meeting", color: "bg-amber-100 text-amber-700" },
  note: { icon: "📝", label: "Note", color: "bg-slate-100 text-slate-700" },
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ActivityTimeline({ leadId }) {
  const user = useAuthStore((state) => state.user);
  const isPrivileged = user?.role === "admin" || user?.role === "manager";

  const { data: activities = [], isLoading, isError } = useLeadActivities(leadId);
  const addActivity = useAddActivity(leadId);
  const deleteActivity = useDeleteActivity(leadId);

  const [form, setForm] = useState({ type: "call", notes: "", date: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await addActivity.mutateAsync({
        type: form.type,
        notes: form.notes,
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      setForm({ type: form.type, notes: "", date: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save activity");
    }
  };

  const handleDelete = (activity) => {
    if (window.confirm("Delete this activity?")) deleteActivity.mutate(activity._id);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-800">Interaction history</h2>

      {/* Add activity form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg bg-slate-50 p-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <div className="grid gap-3 sm:grid-cols-2">
          <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeStyles[type].icon} {typeStyles[type].label}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
            title="Leave empty to use current time"
          />
        </div>

        <textarea
          name="notes"
          rows="2"
          value={form.notes}
          onChange={handleChange}
          required
          placeholder="What happened? e.g. Discussed pricing, wants a demo next week"
          className={inputClass}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addActivity.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {addActivity.isPending ? "Saving..." : "Log activity"}
          </button>
        </div>
      </form>

      {/* Timeline */}
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading history...</p>
      ) : isError ? (
        <p className="text-sm text-red-600">Could not load history</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-slate-500">No interactions logged yet.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => {
            const style = typeStyles[activity.type];
            const canDelete = isPrivileged || activity.createdBy?._id === user?._id;

            return (
              <li key={activity._id} className="flex gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${style.color}`}
                >
                  {style.icon}
                </div>

                <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{style.label}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(activity.date)}</p>
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{activity.notes}</p>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>by {activity.createdBy?.name || "Unknown"}</span>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(activity)}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
