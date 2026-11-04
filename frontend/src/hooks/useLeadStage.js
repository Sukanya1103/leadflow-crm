import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Drag-and-drop ke liye: card pehle turant move hota hai (optimistic),
// server fail ho to wapas purani jagah aa jata hai.
export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }) => (await api.patch(`/leads/${id}/stage`, { stage })).data,

    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });

      // Rollback ke liye purana data save karo
      const previous = queryClient.getQueriesData({ queryKey: ["leads"] });

      queryClient.setQueriesData({ queryKey: ["leads"] }, (old) =>
        Array.isArray(old) ? old.map((lead) => (lead._id === id ? { ...lead, stage } : lead)) : old
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};