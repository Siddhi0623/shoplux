import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({ baseURL: backendUrl });

// Auto-attach admin token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.token = token;
  return config;
});

export default api;
