import axios from "axios";

export const api = axios.create({
    baseURL: "https://smartgaonadmin.duckdns.org",
    // baseURL: "http://localhost:9090",
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("adminToken");
//   if (token) config.headers.Authorization = "Bearer " + token;
//   return config;
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});