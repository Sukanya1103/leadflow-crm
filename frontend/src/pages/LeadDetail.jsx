import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLead } from "../hooks/useLeadDetail";
import LeadForm from "../components/LeadForm";
import ActivityTimeline from "../components/ActivityTimeline";

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

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-slate-700">{value || "-"}</p>
  </div>
);

export default function LeadDetail() {
  const { id } = useParams();
  const { data: lead, isLoading, isError, error } = useLead(id);
  const [editing, setEditing] = useState(false);

  if (isLoading) return <p className="text-slate-500">Loading lead...</p>;

  if (isError) {
    return (
      <div>
        <p className="text-red-600">{error.response?.data?.message || "Could not load this lead"}</p>
        <Link to="/leads" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          ← Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/leads" className="text-sm text-indigo-600 hover:underline">
        ← Back to leads
      </Link>

      {/* Header + info */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{lead.name}</h1>
            <p className="text-sm text-slate-500">{lead.company || "No company"}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                stageColors[lead.stage] || "bg-slate-100 text-slate-700"
              }`}
            >
              {lead.stage}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Email" value={lead.email} />
          <InfoItem label="Phone" value={lead.phone} />
          <InfoItem label="Source" value={lead.source} />
          <InfoItem label="Deal value" value={formatCurrency(lead.dealValue)} />
          <InfoItem label="Assigned to" value={lead.assignedTo?.name || "Unassigned"} />
          <InfoItem label="Follow-up date" value={formatDate(lead.followUpDate)} />
          <InfoItem label="Created by" value={lead.createdBy?.name} />
          <InfoItem label="Created on" value={formatDate(lead.createdAt)} />
        </div>

        {lead.notes && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{lead.notes}</p>
          </div>
        )}
      </div>

      <ActivityTimeline leadId={lead._id} />

      {editing && <LeadForm lead={lead} onClose={() => setEditing(false)} />}
    </div>
  );
}
