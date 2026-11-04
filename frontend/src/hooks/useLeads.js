import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const STAGES = ["Prospect", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
export const SOURCES = ["Website", "Social Media", "Email", "Referral", "Cold Call", "Other"];

export const useLeads = ({ search = "", stage = "", source = "" } = {}) =>
  useQuery({
    queryKey: ["leads", { search, stage, source }],
    queryFn: async () => (await api.get("/leads", { params: { search, stage, source } })).data,
  });

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/leads", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/leads/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/leads/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};
