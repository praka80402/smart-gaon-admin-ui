import axios from "axios";
import { loaderStore } from "../loaderStore";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL ||
  "https://smartgaonadmin.duckdns.org",
  // "http://localhost:9090",
});

// Helper: check if a JWT token is expired based on its payload exp claim
function isJwtExpired(token) {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));
    if (!payload || !payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return false;
  }
}

// Centralized logout handler
function handleTokenLogout() {
  localStorage.clear();
  sessionStorage.clear();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

// Global Request Interceptor
const requestInterceptor = (config) => {
  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  const url = config?.url || "";
  const isLogin = url.includes("/login") || url.includes("/admin/login");

  // If token is already expired before sending request, abort and log out
  if (token && !isLogin && isJwtExpired(token)) {
    handleTokenLogout();
    return Promise.reject(new axios.Cancel("Session expired"));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (loaderStore && typeof loaderStore.show === "function") {
    loaderStore.show();
  }
  return config;
};

// Global Response Success Interceptor
const responseSuccessInterceptor = (response) => {
  if (loaderStore && typeof loaderStore.hide === "function") {
    loaderStore.hide();
  }
  return response;
};

// Global Response Error Interceptor
const responseErrorInterceptor = (error) => {
  if (loaderStore && typeof loaderStore.hide === "function") {
    loaderStore.hide();
  }

  const status = error.response ? error.response.status : null;
  const url = error.config?.url || "";
  const isLogin = url.includes("/login") || url.includes("/admin/login");

  if (!isLogin) {
    // 401 Unauthorized: token missing, invalid, or expired -> log out
    if (status === 401) {
      handleTokenLogout();
      return new Promise(() => {}); // Halt promise chain to prevent downstream error alerts
    }

    // 403 Forbidden: check if token is expired before logging out
    if (status === 403) {
      const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
      if (isJwtExpired(token)) {
        // Token has expired -> log out
        handleTokenLogout();
        return new Promise(() => {}); // Halt promise chain
      }
      // Token is still valid; this is a permission/role issue, do not log out
    }
  }

  return Promise.reject(error);
};

// Apply to api instance
api.interceptors.request.use(requestInterceptor, (error) => {
  if (loaderStore && typeof loaderStore.hide === "function") {
    loaderStore.hide();
  }
  return Promise.reject(error);
});
api.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

// Also apply response interceptor to global axios instance for direct axios calls
axios.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default api;
