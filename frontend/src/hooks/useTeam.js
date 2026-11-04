import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// ---------- Users ----------
export const useUsers = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
    enabled,
  });

// body me role, team (id ya null) ya isActive bhejo
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => (await api.patch(`/users/${id}`, body)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

// ---------- Teams ----------
export const useTeams = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await api.get("/teams")).data,
    enabled,
  });

const useTeamMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useCreateTeam = () => useTeamMutation(async (body) => (await api.post("/teams", body)).data);

export const useUpdateTeam = () =>
  useTeamMutation(async ({ id, ...body }) => (await api.put(`/teams/${id}`, body)).data);

export const useDeleteTeam = () => useTeamMutation(async (id) => (await api.delete(`/teams/${id}`)).data);

// ---------- Lead assignment ----------
export const useAssignLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignedTo }) => (await api.patch(`/leads/${id}/assign`, { assignedTo })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
};