import { useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useDeleteTeam, useTeams, useUpdateUser, useUsers } from "../hooks/useTeam";
import TeamForm from "../components/TeamForm";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "sales_rep", label: "Sales Rep" },
];

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400";

export default function Team() {
  const currentUser = useAuthStore((state) => state.user);

  const [tab, setTab] = useState("users");
  const [teamForm, setTeamForm] = useState(undefined); // undefined = band, null = naya, object = edit
  const [message, setMessage] = useState("");

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const updateUser = useUpdateUser();
  const deleteTeam = useDeleteTeam();

  // Sirf admin ke liye (backend bhi yahi check karta hai)
  if (currentUser && currentUser.role !== "admin") return <Navigate to="/" replace />;

  const changeUser = (id, body) => {
    setMessage("");
    updateUser.mutate(
      { id, ...body },
      { onError: (err) => setMessage(err.response?.data?.message || "Could not update user") }
    );
  };

  const handleDeleteTeam = (team) => {
    if (window.confirm(`Delete team "${team.name}"? Its members will be left without a team.`)) {
      setMessage("");
      deleteTeam.mutate(team._id, {
        onError: (err) => setMessage(err.response?.data?.message || "Could not delete team"),
      });
    }
  };

  const tabClass = (name) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      tab === name ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team management</h1>
          <p className="text-sm text-slate-500">Manage users, roles and teams.</p>
        </div>
        {tab === "teams" && (
          <button
            onClick={() => setTeamForm(null)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Team
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button className={tabClass("users")} onClick={() => setTab("users")}>
          Users ({users.length})
        </button>
        <button className={tabClass("teams")} onClick={() => setTab("teams")}>
          Teams ({teams.length})
        </button>
      </div>

      {message && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{message}</div>}

      {/* USERS TAB */}
      {tab === "users" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {usersLoading ? (
            <p className="p-8 text-center text-slate-500">Loading users...</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;

                  return (
                    <tr key={u._id} className={u.isActive ? "" : "bg-slate-50 opacity-70"}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {u.name} {isSelf && <span className="text-xs font-normal text-slate-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => changeUser(u._id, { role: e.target.value })}
                          className={selectClass}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.team?._id || ""}
                          onChange={(e) => changeUser(u._id, { team: e.target.value || null })}
                          className={selectClass}
                        >
                          <option value="">No team</option>
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={isSelf}
                          onClick={() => changeUser(u._id, { isActive: !u.isActive })}
                          className={`rounded-full px-3 py-1 text-xs font-medium disabled:cursor-not-allowed ${
                            u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                          title={isSelf ? "You can't deactivate yourself" : "Click to toggle"}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TEAMS TAB */}
      {tab === "teams" && (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {teamsLoading ? (
            <p className="p-8 text-center text-slate-500">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No teams yet. Click &quot;New Team&quot; to create one.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr key={team._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{team.name}</td>
                    <td className="px-4 py-3 text-slate-600">{team.manager?.name || "No manager"}</td>
                    <td className="px-4 py-3 text-slate-600">{team.memberCount}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setTeamForm(team)}
                        className="mr-3 text-sm font-medium text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {teamForm !== undefined && (
        <TeamForm team={teamForm} users={users} onClose={() => setTeamForm(undefined)} />
      )}
    </div>
  );
}
