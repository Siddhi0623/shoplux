import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: backendUrl,
});

// AUTO-ATTACH TOKEN TO EVERY REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.token = token;
  return config;
});

export default api;
