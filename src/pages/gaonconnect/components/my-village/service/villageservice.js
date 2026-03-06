import axios from "axios";
import { BASE_URL, authHeader } from "./config";

const API = `${BASE_URL}/admin/villages`;
// ================= GET ALL =================
export const getAllVillages = () =>
  axios.get(API, {
    headers: authHeader(),
  });

// ================= GET SMART GAON =================
export const getSmartGaonVillages = () =>
  axios.get(`${API}/smart-gaon`, {
    headers: authHeader(),
  });

// ================= GET BY ID =================
export const getVillageById = (id) =>
  axios.get(`${API}/${id}`, {
    headers: authHeader(),
  });

// ================= CREATE =================
export const createVillage = (formData) =>
  axios.post(`${API}/upload`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

// ================= UPDATE =================
// export const updateVillage = (id, data) =>
//   axios.put(
//     // `https://smartgaonadmin.duckdns.org/admin/villages/${id}`,
//     `http://localhost:9090/admin/villages/${id}`,
//     data,
//     {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("adminToken"),
//         "Content-Type": "application/json",
//       },
//     }
//   );

export const updateVillage = (id, data) =>
  axios.put(`${API}/${id}`, data, {
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
  });

// ================= DELETE =================
export const deleteVillage = (id) =>
  axios.delete(`${API}/${id}`, {
    headers: authHeader(),
  });