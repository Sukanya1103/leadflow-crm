import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useAuthStore from "../store/authStore";
import { useDashboardStats } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";

const STAGE_COLORS = {
  Prospect: "#94a3b8",
  Qualification: "#3b82f6",
  Proposal: "#a855f7",
  Negotiation: "#f59e0b",
  "Closed Won": "#22c55e",
  "Closed Lost": "#ef4444",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatCompact = (value) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const ChartCard = ({ title, children }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-base font-bold text-slate-800">{title}</h2>
    <div className="h-72">{children}</div>
  </div>
);

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isLoading) return <p className="text-slate-500">Loading dashboard...</p>;
  if (isError) {
    return <p className="text-red-600">{error.response?.data?.message || "Could not load dashboard"}</p>;
  }

  const { summary, funnel, sources, monthlySales, upcomingFollowUps } = data;
  const isRep = user?.role === "sales_rep";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back, {user?.name}. {isRep ? "Showing your assigned leads." : "Showing all leads."}
        </p>
      </div>

      {summary.overdueFollowUps > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ You have {summary.overdueFollowUps} overdue follow-up(s).{" "}
          <Link to="/leads" className="font-semibold underline">
            View leads
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total leads"
          value={summary.totalLeads}
          sub={`${summary.activeLeads} active`}
          icon="👥"
        />
        <StatCard
          label="Pipeline value"
          value={formatCurrency(summary.activePipelineValue)}
          sub="Open deals only"
          icon="💼"
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(summary.thisMonthRevenue)}
          sub={`${formatCurrency(summary.wonRevenue)} total won`}
          icon="💰"
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          label="Conversion rate"
          value={`${summary.conversionRate}%`}
          sub={`${summary.wonDeals} won · ${summary.lostDeals} lost`}
          icon="🎯"
          accent="bg-amber-100 text-amber-600"
        />
      </div>

      {summary.totalLeads === 0 && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No data yet. Add your first lead to see the charts.</p>
          <Link
            to="/leads"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Go to Leads
          </Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Sales pipeline (leads per stage)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="stage" width={95} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, _name, item) => [
                  `${value} lead(s) · ${formatCurrency(item.payload.value)}`,
                  "Stage",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {funnel.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly sales (Closed Won revenue)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySales} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `₹${formatCompact(v)}`} width={70} />
              <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead sources">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sources} margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="source" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} lead(s)`, "Leads"]} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Upcoming follow-ups */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Upcoming follow-ups</h2>

          {upcomingFollowUps.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming follow-ups. Set a follow-up date on a lead.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingFollowUps.map((lead) => (
                <li key={lead._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/leads/${lead._id}`}
                      className="block truncate text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {lead.company || "No company"} · {lead.stage}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    📅 {formatDate(lead.followUpDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
