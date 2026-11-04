import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Key ["leads", ...] se shuru hai, isliye lead change hone par report bhi refresh hoti hai.
export const useTeamReport = ({ from = "", to = "", enabled = true } = {}) =>
  useQuery({
    queryKey: ["leads", "team-report", from, to],
    queryFn: async () => {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      return (await api.get("/reports/team", { params })).data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });