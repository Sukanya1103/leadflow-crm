import { create } from "zustand";
import api from "../services/api";

const STORAGE_KEY = "leadflow_auth";

const useAuthStore = create((set) => ({
  user: null,
  loading: true, // app khulte waqt token check hone tak true

  // App khulte hi ek baar call karo (App.jsx me)
  checkAuth: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      set({ user: null, loading: false });
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, loading: false });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { token, ...user } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
    set({ user });
    return user;
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    const { token, ...user } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
    set({ user });
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));

export default useAuthStore;