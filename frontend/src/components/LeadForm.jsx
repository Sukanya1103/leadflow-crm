import { useEffect, useState } from "react";
import { SOURCES, STAGES, useCreateLead, useUpdateLead } from "../hooks/useLeads";

const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Other",
  stage: "Prospect",
  dealValue: "0",
  followUpDate: "",
  notes: "",
};

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export default function LeadForm({ lead, onClose }) {
  const isEditing = Boolean(lead?._id);
  const [form, setForm] = useState(emptyForm);
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const mutation = isEditing ? updateLead : createLead;

  useEffect(() => {
    if (!lead) {
      setForm(emptyForm);
      return;
    }
    setForm({
      name: lead.name || "",
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "Other",
      stage: lead.stage || "Prospect",
      dealValue: String(lead.dealValue ?? 0),
      followUpDate: toDateInput(lead.followUpDate),
      notes: lead.notes || "",
    });
  }, [lead]);

  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      dealValue: Number(form.dealValue) || 0,
      followUpDate: form.followUpDate || null,
    };
    try {
      if (isEditing) await updateLead.mutateAsync({ id: lead._id, payload });
      else await createLead.mutateAsync(payload);
      onClose();
    } catch {
      // The mutation error is shown inline in the form.
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="my-6 w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit lead" : "Add lead"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>
        {mutation.isError && <p role="alert" className="text-sm text-red-600">{mutation.error.response?.data?.message || "Could not save lead"}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">Name *<input required name="name" value={form.name} onChange={setField} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Company<input name="company" value={form.company} onChange={setField} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Email<input type="email" name="email" value={form.email} onChange={setField} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Phone<input name="phone" value={form.phone} onChange={setField} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Source<select name="source" value={form.source} onChange={setField} className={inputClass}>{SOURCES.map((source) => <option key={source}>{source}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Stage<select name="stage" value={form.stage} onChange={setField} className={inputClass}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Deal value (₹)<input type="number" min="0" step="1" name="dealValue" value={form.dealValue} onChange={setField} className={inputClass} /></label>
          <label className="space-y-1 text-sm font-medium text-slate-700">Follow-up date<input type="date" name="followUpDate" value={form.followUpDate} onChange={setField} className={inputClass} /></label>
        </div>
        <label className="block space-y-1 text-sm font-medium text-slate-700">Notes<textarea rows="3" name="notes" value={form.notes} onChange={setField} className={inputClass} /></label>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
          <button disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{mutation.isPending ? "Saving…" : "Save lead"}</button>
        </div>
      </form>
    </div>
  );
}
