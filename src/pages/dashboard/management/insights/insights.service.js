import axios from "axios";

const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/dashboard";

// 🔹 GET DATA
export const getInsightsData = async () => {
  try {
    console.log("API CALL STARTED");
    
    const token = localStorage.getItem("adminToken");

    const res = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data || res.data;
  } catch (error) {
    console.error("GET ERROR:", error);
    return [];
  }
};

// 🔹 ADD
export const addInsight = async (payload) => {
  const token = localStorage.getItem("adminToken");

  return axios.post(BASE_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// 🔹 UPDATE
export const updateInsight = async (id, payload) => {
  const token = localStorage.getItem("adminToken");

  return axios.put(`${BASE_URL}/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// 🔹 DELETE
export const deleteInsight = async (id) => {
  const token = localStorage.getItem("adminToken");

  return axios.delete(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};