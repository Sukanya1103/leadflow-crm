import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Har request ke saath token automatically bhejo
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("leadflow_auth");
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem("leadflow_auth");
    }
  }
  return config;
});

export default api;