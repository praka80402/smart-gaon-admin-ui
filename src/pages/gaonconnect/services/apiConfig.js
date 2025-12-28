import axios from "axios";

export const api = axios.create({
  baseURL: "https://smartgaonadmin.duckdns.org",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
