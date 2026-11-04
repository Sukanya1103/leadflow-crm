import { useState } from "react";
import { useCreateTeam, useUpdateTeam } from "../hooks/useTeam";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

// team = null -> naya team, team = {...} -> edit
export default function TeamForm({ team, users, onClose }) {
  const isEdit = Boolean(team);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [name, setName] = useState(team?.name || "");
  const [manager, setManager] = useState(team?.manager?._id || "");
  const [error, setError] = useState("");

  const saving = createTeam.isPending || updateTeam.isPending;

  // Sirf active manager ya admin hi team manager ban sakte hain
  const managerOptions = users.filter((u) => u.isActive && ["manager", "admin"].includes(u.role));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = { name, manager: manager || null };

    try {
      if (isEdit) {
        await updateTeam.mutateAsync({ id: team._id, ...payload });
      } else {
        await createTeam.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Team" : "New Team"}</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600" aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Team name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. North Region Sales"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Manager</label>
            <select value={manager} onChange={(e) => setManager(e.target.value)} className={inputClass}>
              <option value="">No manager</option>
              {managerOptions.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            {managerOptions.length === 0 && (
              <p className="mt-1 text-xs text-slate-400">
                No managers yet. Change a user&apos;s role to Manager in the Users tab first.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
