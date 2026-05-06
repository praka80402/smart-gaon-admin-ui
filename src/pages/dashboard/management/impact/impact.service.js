import axios from "axios";

const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/states";

// 🔹 GET DATA
export const getImpactData = async () => {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data || res.data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

// ➕ ADD STATE
export const addState = async (payload) => {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await axios.post(BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Add Error:", error);
  }
};

// ✏ UPDATE STATE
export const updateState = async (id, payload) => {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await axios.put(`${BASE_URL}/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Update Error:", error);
  }
};

// ❌ DELETE STATE
export const deleteState = async (id) => {
  try {
    const token = localStorage.getItem("adminToken");

    const res = await axios.delete(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Delete Error:", error);
  }
};