import axios from "axios";

// const API_BASE = "http://localhost:9090/admin/offers";
const API_BASE = "https://smartgaonadmin.duckdns.org/admin/offers";

const getAuthHeader = () => {
  const token = localStorage.getItem("adminToken"); // ✅ FIXED
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllOfficers = () => {
  return axios.get(API_BASE, getAuthHeader());
};

export const getOfficerById = (id) => {
  return axios.get(`${API_BASE}/${id}`, getAuthHeader());
};

export const addOfficer = (data) => {
  return axios.post(API_BASE, data, getAuthHeader());
};

export const updateOfficer = (id, data) => {
  return axios.put(`${API_BASE}/${id}`, data, getAuthHeader());
};

export const deleteOfficer = (id) => {
  return axios.delete(`${API_BASE}/${id}`, getAuthHeader());
};