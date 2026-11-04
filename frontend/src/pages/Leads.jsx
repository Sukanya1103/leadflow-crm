import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { SOURCES, STAGES, useDeleteLead, useLeads } from "../hooks/useLeads";
import LeadForm from "../components/LeadForm";
import { useAssignLead, useUsers } from "../hooks/useTeam";

const stageColors = {
  Prospect: "bg-slate-100 text-slate-700",
  Qualification: "bg-blue-100 text-blue-700",
  Proposal: "bg-purple-100 text-purple-700",
  Negotiation: "bg-amber-100 text-amber-700",
  "Closed Won": "bg-green-100 text-green-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export default function Leads() {
  const user = useAuthStore((state) => state.user);
  const canDelete = user?.role === "admin" || user?.role === "manager";

  const canAssign = canDelete; // admin aur manager
const { data: users = [] } = useUsers({ enabled: canAssign });
const assignLead = useAssignLead();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");

  // Form modal: undefined = band, null = naya lead, object = edit
  const [formLead, setFormLead] = useState(undefined);

  // Typing rukne ke 400ms baad hi search chalao
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: leads = [], isLoading, isError, error } = useLeads({ search, stage, source });
  const deleteLead = useDeleteLead();

  const handleDelete = (lead) => {
    if (window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) {
      deleteLead.mutate(lead._id);
    }
  };

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
          <p className="text-sm text-slate-500">{leads.length} lead(s)</p>
        </div>
        <button
          onClick={() => setFormLead(null)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, company, email, phone..."
          className="min-w-64 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <select value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading leads...</p>
        ) : isError ? (
          <p className="p-8 text-center text-red-600">
            {error.response?.data?.message || "Could not load leads"}
          </p>
        ) : leads.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No leads found. Click &quot;Add Lead&quot; to create your first one.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Deal value</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
<Link to={`/leads/${lead._id}`} className="font-semibold text-indigo-600 hover:underline">
  {lead.name}
</Link>                    <p className="text-xs text-slate-500">{lead.company || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{lead.email || "-"}</p>
                    <p className="text-xs text-slate-500">{lead.phone || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        stageColors[lead.stage] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(lead.dealValue)}</td>
                  <td className="px-4 py-3 text-slate-600">
  {canAssign ? (
    <select
      value={lead.assignedTo?._id || ""}
      onChange={(e) =>
        e.target.value &&
        assignLead.mutate(
          { id: lead._id, assignedTo: e.target.value },
          { onError: (err) => alert(err.response?.data?.message || "Could not assign lead") }
        )
      }
      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
    >
      <option value="" disabled>
        Unassigned
      </option>
      {users
        .filter((u) => u.isActive || u._id === lead.assignedTo?._id)
        .map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
    </select>
  ) : (
    lead.assignedTo?.name || "Unassigned"
  )}
</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(lead.followUpDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setFormLead(lead)}
                      className="mr-3 text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(lead)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formLead !== undefined && <LeadForm lead={formLead} onClose={() => setFormLead(undefined)} />}
    </div>
  );
}
