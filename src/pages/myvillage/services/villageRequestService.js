import { api } from "./config";

const API = "/api/admin/village-requests";

// status: "pending" | "approved" | "rejected" | "all"
export const getVillageRequests = (status = "pending") =>
  api.get(API, { params: { status } });

export const getVillageRequestById = (id) => api.get(`${API}/${id}`);

export const getPendingCount = () => api.get(`${API}/pending-count`);

export const approveVillageRequest = (id) => api.put(`${API}/${id}/approve`);

export const rejectVillageRequest = (id, reason) =>
  api.put(`${API}/${id}/reject`, { reason });

export const deleteVillageRequest = (id) => api.delete(`${API}/${id}`);

/** Image URLs from the API are already absolute; this is kept for safety. */
export function fileUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : path;
}