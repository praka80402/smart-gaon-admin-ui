import { api } from "../../pages/gaonconnect/services/apiConfig";

// baseURL already = https://smartgaonadmin.duckdns.org
const BASE = "/api/admin/schemes";

// ---------------- CREATE ----------------
export const createScheme = (data) => {
  return api.post(BASE, data);
};

// ---------------- GET ALL ----------------
export const getAllSchemes = () => {
  return api.get(BASE);
};

// ---------------- DELETE ----------------
export const deleteScheme = (id) => {
  return api.delete(`${BASE}/${id}`);
};

// ---------------- UPDATE ----------------
export const updateScheme = (id, data) => {
  return api.put(`${BASE}/${id}`, data);
};
