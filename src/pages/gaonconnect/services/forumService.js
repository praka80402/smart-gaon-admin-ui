import { api } from "./apiConfig";
import axios from "axios";

export const getAllForumPosts = (params) =>
  api.get(`/admin/forum/list`, { params });

export const deleteForumPost = (id) =>
  api.delete(`/admin/forum/${id}`);

/* ================= REPORTS ================= */
export const getForumPostReports = (postId) =>
  api.get(`/admin/forum/reports/${postId}`);

export const approveForumPost = (postId, comment = "Approved after review") =>
  api.post(`/admin/forum/${postId}/approve`, { comment });

export const rejectForumPost = (postId, comment) =>
  api.post(`/admin/forum/${postId}/reject`, { comment });

const getLocalForumUserId = () => {
  const directKeys = ["userId", "id", "memberId"];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  const objectKeys = ["user", "userData", "loggedInUser", "profile"];

  for (const key of objectKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const nestedId = parsed?.userId || parsed?.id || parsed?.memberId;
      if (nestedId) return nestedId;
    } catch {
      // Ignore malformed localStorage values.
    }
  }

  return "";
};

export const createForumPostMulti = async ({
  title,
  content,
  category = "GENERAL",
  area = "",
  youtubeVideoUrl = "",
  mediaFiles = [],
  userId,
}) => {
  const resolvedUserId = userId || getLocalForumUserId();
  const formData = new FormData();

  formData.append("userId", String(resolvedUserId));
  formData.append("title", title);
  formData.append("content", content);
  formData.append("category", category);
  formData.append("area", area);

  if (youtubeVideoUrl) {
    formData.append("youtubeVideoUrl", youtubeVideoUrl);
  }

  mediaFiles.forEach((file) => {
    formData.append("media", file);
  });

  return axios.post(
    "https://smartgaon.duckdns.org/api/forum/posts/create-multi",
    formData
  );
};

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
