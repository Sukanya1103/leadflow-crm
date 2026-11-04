import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];

// Ek lead ki detail.
// Key ["leads", ...] se shuru hai, isliye lead edit/stage change hone par ye apne aap refresh hota hai.
export const useLead = (id) =>
  useQuery({
    queryKey: ["leads", "detail", id],
    queryFn: async () => (await api.get(`/leads/${id}`)).data,
    enabled: Boolean(id),
  });

// Lead ki activity history
export const useLeadActivities = (leadId) =>
  useQuery({
    queryKey: ["activities", leadId],
    queryFn: async () => (await api.get(`/activities/lead/${leadId}`)).data,
    enabled: Boolean(leadId),
  });

export const useAddActivity = (leadId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/activities/lead/${leadId}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities", leadId] }),
  });
};

export const useDeleteActivity = (leadId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId) => (await api.delete(`/activities/${activityId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activities", leadId] }),
  });
};