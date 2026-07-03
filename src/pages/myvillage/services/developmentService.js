import { api } from "./config";

export const getAllDevelopments = () => api.get("/api/admin/developments");

export const getDevelopmentsByPhase = (phaseNumber) =>
  api.get(`/api/admin/developments/phase/${phaseNumber}`);

export const getDevelopmentById = (id) => api.get(`/api/admin/developments/${id}`);

export const createDevelopment = (payload) =>
  api.post("/api/admin/developments", payload);

export const updateDevelopment = (id, payload) =>
  api.put(`/api/admin/developments/${id}`, payload);

export const deleteDevelopment = (id) => api.delete(`/api/admin/developments/${id}`);

export const getPhases = () => api.get("/api/admin/developments/phases");