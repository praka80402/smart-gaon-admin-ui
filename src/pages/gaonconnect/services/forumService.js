import { api } from "./apiConfig";

export const getAllForumPosts = (params) =>
  api.get(`/admin/forum/list`, { params });

export const deleteForumPost = (id) =>
  api.delete(`/admin/forum/${id}`);

/* ================= REPORTS ================= */
export const getForumPostReports = (postId) =>
  api.get(`/admin/forum/reports/${postId}`);

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:9090",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Attach ADMIN token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("adminToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const getAllForumPosts = (params) =>
//   api.get("/admin/forum/list", { params });

// export const deleteForumPost = (id) =>
//   api.delete(`/admin/forum/${id}`);
