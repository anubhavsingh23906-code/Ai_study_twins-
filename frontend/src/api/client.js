import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ai-study-twin-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ai-study-twin-token");
      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
