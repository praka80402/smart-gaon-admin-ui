import axios from "axios";

// const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/villages";
 const BASE_URL = "http://localhost:9090/admin/villages";

const authHeader = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: "Bearer " + token,
  };
};

// ================= GET ALL =================
export const getAllVillages = () =>
  axios.get(BASE_URL, {
    headers: authHeader(),
  });

// ================= GET SMART GAON =================
export const getSmartGaonVillages = () =>
  axios.get(`${BASE_URL}/smart-gaon`, {
    headers: authHeader(),
  });

// ================= GET BY ID =================
export const getVillageById = (id) =>
  axios.get(`${BASE_URL}/${id}`, {
    headers: authHeader(),
  });

// ================= CREATE =================
export const createVillage = (formData) =>
  axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

// ================= UPDATE =================
export const updateVillage = (id, data) =>
  axios.put(
    `https://smartgaonadmin.duckdns.org/admin/villages/${id}`,
    // `http://localhost:9090/admin/villages/${id}`,
    data,
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
        "Content-Type": "application/json",
      },
    }
  );

// ================= DELETE =================
export const deleteVillage = (id) =>
  axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeader(),
  });