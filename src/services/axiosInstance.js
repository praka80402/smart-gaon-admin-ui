import axios from "axios";
import { loaderStore } from "../loaderStore";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 
  "https://smartgaonadmin.duckdns.org",
  // baseURL: "http://localhost:9090",
});

// Single Global Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (loaderStore && typeof loaderStore.show === "function") {
      loaderStore.show();
    }
    return config;
  },
  (error) => {
    if (loaderStore && typeof loaderStore.hide === "function") {
      loaderStore.hide();
    }
    return Promise.reject(error);
  }
);

// Single Global Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (loaderStore && typeof loaderStore.hide === "function") {
      loaderStore.hide();
    }
    return response;
  },
  (error) => {
    if (loaderStore && typeof loaderStore.hide === "function") {
      loaderStore.hide();
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      // Silently absorb error during redirect to prevent React Dev Overlay red screen
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

export default api;
