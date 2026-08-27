import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:9090",
  baseURL: "https://smartgaonadmin.duckdns.org"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor: Auto-logout and redirect to /login whenever session token expires (401/403 HTTP Error)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
