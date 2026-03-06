import axios from "axios";
import { BASE_URL, authHeader } from "./config";

const API = `${BASE_URL}/admin/village-development`;

// ================= ASSIGN DEVELOPMENT =================
export const assignDevelopmentToVillage = async ({
  villageId,
  developmentId,
  progress,
  remarks,
  images
}) => {

  const formData = new FormData();

  formData.append("villageId", villageId);
  formData.append("developmentId", developmentId);
  formData.append("progress", progress);
  formData.append("remarks", remarks || "");

  if (images) {
    images.forEach(img => formData.append("images", img));
  }

  const res = await axios.post(API, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ================= GET BY VILLAGE =================
export const getVillageDevelopments = async (villageId) => {
  const res = await axios.get(
    `${API}/village/${villageId}`,
    {
      headers: authHeader(),
    }
  );
  return res.data;
};

// ================= UPDATE PROGRESS =================


export const updateVillageDevelopment = async (id, formData) => {
  const res = await axios.put(
    `${API}/${id}`,
    formData,
    {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return res.data;
};

// ================= DELETE =================
export const deleteVillageDevelopment = async (id) => {
  await axios.delete(
    `${API}/${id}`,
    {
      headers: authHeader(),
    }
  );

  
};