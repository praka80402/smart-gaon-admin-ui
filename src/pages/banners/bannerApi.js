import axios from "axios";

//const API_URL = "http://localhost:9090/api/admin/banners";
const API_URL = "https://smartgaonadmin.duckdns.org/api/admin/banners";
// baseURL: "https://smartgaonadmin.duckdns.org/api",

export const getBanners = () => axios.get(API_URL);

export const getBannerById = (id) => axios.get(`${API_URL}/${id}`);

export const createBanner = (formData) =>
  axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBanner = (id, formData) =>
  axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBanner = (id) => axios.delete(`${API_URL}/${id}`);
