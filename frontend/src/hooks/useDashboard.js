import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Key ["leads", ...] se shuru hai, isliye lead add/edit/delete/stage change hone par
// dashboard ke numbers apne aap refresh ho jate hain.
export const useDashboardStats = () =>
  useQuery({
    queryKey: ["leads", "dashboard-stats"],
    queryFn: async () => (await api.get("/dashboard/stats")).data,
  });