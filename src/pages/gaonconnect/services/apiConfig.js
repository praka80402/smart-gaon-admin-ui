import axios from "axios";
import { loaderStore } from "../../../loaderStore";

export const api = axios.create({
    baseURL: "https://smartgaonadmin.duckdns.org",
    //baseURL: "http://localhost:9090",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    loaderStore.show(); 
    return config;
  },
  (error) => {
    loaderStore.hide(); 
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    loaderStore.hide(); // ✅ HIDE loader
    return response;
  },
  (error) => {
    loaderStore.hide(); // ✅ HIDE loader
    return Promise.reject(error);
  }
);
