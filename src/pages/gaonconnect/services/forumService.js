import { api } from "./apiConfig";

export const getAllForumPosts = (params) =>
  api.get(`/admin/forum/list`, { params });

export const deleteForumPost = (id) =>
  api.delete(`/admin/forum/${id}`);
