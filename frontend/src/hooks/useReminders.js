import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Apne follow-up reminders (overdue aur aaj ke).
// Key ["leads", ...] se shuru hai, isliye lead change hone par refresh hota hai.
// Har 5 minute me bhi apne aap check karta hai.
export const useReminders = () =>
  useQuery({
    queryKey: ["leads", "reminders"],
    queryFn: async () => (await api.get("/reminders")).data,
    refetchInterval: 5 * 60 * 1000,
  });