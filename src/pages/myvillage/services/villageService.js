import { api } from "./config";

export const getAllVillages = () => api.get("/api/admin/villages");

export const getVillageById = (id) => api.get(`/api/admin/villages/${id}`);

export const createVillage = (payload) => api.post("/api/admin/villages", payload);

export const updateVillage = (id, payload) =>
  api.put(`/api/admin/villages/${id}`, payload);

export const deleteVillage = (id) => api.delete(`/api/admin/villages/${id}`);