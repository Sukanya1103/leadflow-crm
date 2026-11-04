import { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { STAGES, useLeads } from "../hooks/useLeads";
import { useUpdateLeadStage } from "../hooks/useLeadStage";

const columnColors = {
  Prospect: "border-slate-400",
  Qualification: "border-blue-500",
  Proposal: "border-purple-500",
  Negotiation: "border-amber-500",
  "Closed Won": "border-green-500",
  "Closed Lost": "border-red-500",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    value || 0
  );

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : null;

export default function Pipeline() {
  const { data: leads = [], isLoading, isError, error } = useLeads();
  const updateStage = useUpdateLeadStage();
  const [moveError, setMoveError] = useState("");

  // Leads ko stage ke hisaab se group karo
  const columns = useMemo(() => {
    const grouped = Object.fromEntries(STAGES.map((stage) => [stage, []]));
    leads.forEach((lead) => {
      if (grouped[lead.stage]) grouped[lead.stage].push(lead);
    });
    return grouped;
  }, [leads]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Bahar drop hua ya same column me chhoda
    if (!destination || destination.droppableId === source.droppableId) return;

    setMoveError("");
    updateStage.mutate(
      { id: draggableId, stage: destination.droppableId },
      {
        onError: (err) =>
          setMoveError(err.response?.data?.message || "Could not move the lead. Please try again."),
      }
    );
  };

  if (isLoading) return <p className="text-slate-500">Loading pipeline...</p>;
  if (isError) {
    return <p className="text-red-600">{error.response?.data?.message || "Could not load pipeline"}</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Sales Pipeline</h1>
        <p className="text-sm text-slate-500">Drag a lead card to another column to change its stage.</p>
      </div>

      {moveError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{moveError}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = columns[stage];
            const total = stageLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);

            return (
              <div
                key={stage}
                className={`w-72 shrink-0 rounded-xl border-t-4 bg-slate-200/60 ${columnColors[stage]}`}
              >
                <div className="px-3 pb-2 pt-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">{stage}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{formatCurrency(total)}</p>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-40 space-y-2 rounded-b-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-indigo-100/70" : ""
                      }`}
                    >
                      {stageLeads.map((lead, index) => (
                        <Draggable key={lead._id} draggableId={lead._id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`rounded-lg bg-white p-3 shadow-sm ${
                                dragSnapshot.isDragging ? "shadow-lg ring-2 ring-indigo-400" : ""
                              }`}
                            >
                              <p className="font-semibold text-slate-800">{lead.name}</p>
                              <p className="text-xs text-slate-500">{lead.company || "No company"}</p>

                              <p className="mt-2 text-sm font-medium text-slate-700">
                                {formatCurrency(lead.dealValue)}
                              </p>

                              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                <span>{lead.assignedTo?.name || "Unassigned"}</span>
                                {formatDate(lead.followUpDate) && (
                                  <span>📅 {formatDate(lead.followUpDate)}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
