import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useAuthStore from "../store/authStore";
import { useTeamReport } from "../hooks/useReports";
import StatCard from "../components/StatCard";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatCompact = (value) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

// yyyy-mm-dd (local date), <input type="date"> ke liye
const toInputDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getPreset = (name) => {
  const today = new Date();
  if (name === "30d") {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { from: toInputDate(start), to: toInputDate(today) };
  }
  if (name === "month") {
    return { from: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toInputDate(today) };
  }
  if (name === "year") {
    return { from: toInputDate(new Date(today.getFullYear(), 0, 1)), to: toInputDate(today) };
  }
  return { from: "", to: "" }; // all time
};

const ChartCard = ({ title, children }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-base font-bold text-slate-800">{title}</h2>
    <div className="h-72">{children}</div>
  </div>
);

const Th = ({ children, right }) => (
  <th className={`px-4 py-3 ${right ? "text-right" : ""}`}>{children}</th>
);
const Td = ({ children, right, bold }) => (
  <td className={`px-4 py-3 text-slate-600 ${right ? "text-right" : ""} ${bold ? "font-semibold text-slate-800" : ""}`}>
    {children}
  </td>
);

export default function Reports() {
  const user = useAuthStore((state) => state.user);
  const isAllowed = user?.role === "admin" || user?.role === "manager";

  const [range, setRange] = useState({ from: "", to: "" });
  const { data, isLoading, isError, error } = useTeamReport({ ...range, enabled: isAllowed });

  // Sales rep ke liye reports nahi hain (backend bhi rokta hai)
  if (user && !isAllowed) return <Navigate to="/" replace />;

  if (isLoading) return <p className="text-slate-500">Loading reports...</p>;
  if (isError) {
    return <p className="text-red-600">{error.response?.data?.message || "Could not load reports"}</p>;
  }

  const { summary, teams, users, unassigned, restrictedToTeam } = data;

  const presetButton = (label, name) => (
    <button
      key={name}
      onClick={() => setRange(getPreset(name))}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
    >
      {label}
    </button>
  );

  const dateInputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sales reports</h1>
        <p className="text-sm text-slate-500">
          {restrictedToTeam ? "Showing your team only." : "Team-wise performance across the company."}
        </p>
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Leads created from</label>
          <input
            type="date"
            value={range.from}
            max={range.to || undefined}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className={dateInputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">to</label>
          <input
            type="date"
            value={range.to}
            min={range.from || undefined}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className={dateInputClass}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {presetButton("All time", "all")}
          {presetButton("Last 30 days", "30d")}
          {presetButton("This month", "month")}
          {presetButton("This year", "year")}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={summary.total} sub={`${summary.active} active`} icon="👥" />
        <StatCard
          label="Revenue (won)"
          value={formatCurrency(summary.revenue)}
          sub={`${summary.won} deals won`}
          icon="💰"
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          label="Open pipeline"
          value={formatCurrency(summary.pipelineValue)}
          sub="Value of active deals"
          icon="💼"
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Conversion rate"
          value={`${summary.conversionRate}%`}
          sub={`${summary.won} won · ${summary.lost} lost`}
          icon="🎯"
          accent="bg-amber-100 text-amber-600"
        />
      </div>

      {unassigned && unassigned.total > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {unassigned.total} lead(s) are not assigned to anyone yet, so they are not part of any team below.
        </div>
      )}

      {teams.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
          No teams to report yet. Create teams and assign users from the Team page.
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue by team">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teams} margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `₹${formatCompact(v)}`} width={70} />
                  <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Lead outcomes by team">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teams} margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" name="Active" stackId="a" fill="#6366f1" />
                  <Bar dataKey="won" name="Won" stackId="a" fill="#22c55e" />
                  <Bar dataKey="lost" name="Lost" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Team table */}
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <h2 className="px-5 pt-5 text-base font-bold text-slate-800">Team-wise report</h2>
            <table className="mt-3 w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <Th>Team</Th>
                  <Th>Manager</Th>
                  <Th right>Members</Th>
                  <Th right>Leads</Th>
                  <Th right>Won</Th>
                  <Th right>Lost</Th>
                  <Th right>Revenue</Th>
                  <Th right>Pipeline</Th>
                  <Th right>Conversion</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((t) => (
                  <tr key={t.teamId || "none"} className="hover:bg-slate-50">
                    <Td bold>{t.name}</Td>
                    <Td>{t.manager}</Td>
                    <Td right>{t.members}</Td>
                    <Td right>{t.total}</Td>
                    <Td right>{t.won}</Td>
                    <Td right>{t.lost}</Td>
                    <Td right bold>
                      {formatCurrency(t.revenue)}
                    </Td>
                    <Td right>{formatCurrency(t.pipelineValue)}</Td>
                    <Td right>{t.conversionRate}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leaderboard */}
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <h2 className="px-5 pt-5 text-base font-bold text-slate-800">Sales leaderboard</h2>
            {users.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No sales activity yet.</p>
            ) : (
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>Team</Th>
                    <Th right>Leads</Th>
                    <Th right>Won</Th>
                    <Th right>Revenue</Th>
                    <Th right>Conversion</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, index) => (
                    <tr key={u.userId} className="hover:bg-slate-50">
                      <Td>{["🥇", "🥈", "🥉"][index] || index + 1}</Td>
                      <Td bold>{u.name}</Td>
                      <Td>{u.team}</Td>
                      <Td right>{u.total}</Td>
                      <Td right>{u.won}</Td>
                      <Td right bold>
                        {formatCurrency(u.revenue)}
                      </Td>
                      <Td right>{u.conversionRate}%</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
