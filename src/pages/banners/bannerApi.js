// import axios from "axios";
import {api} from "../gaonconnect/services/apiConfig";

// const API_URL = "http://localhost:9090/api/admin/banners";
 const API_URL = "https://smartgaonadmin.duckdns.org/api/admin/banners";
// baseURL: "https://smartgaonadmin.duckdns.org/api",

export const getBanners = () => api.get(API_URL);

export const getBannerById = (id) => api.get(`${API_URL}/${id}`);

export const createBanner = (formData) =>
  api.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBanner = (id, formData) =>
  api.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBanner = (id) => api.delete(`${API_URL}/${id}`);
