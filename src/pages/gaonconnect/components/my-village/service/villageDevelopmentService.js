import axios from "axios";
import { BASE_URL, authHeader } from "./config";

const API = `${BASE_URL}/admin/village-development`;

/* ================= ASSIGN DEVELOPMENT ================= */

export const assignDevelopmentToVillage = async (villageId, formData) => {

  const res = await axios.post(
    `${API}/village/${villageId}`,
    formData,
    {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;

};


/* ================= GET BY VILLAGE ================= */

export const getVillageDevelopments = async (villageId) => {

  const res = await axios.get(
    `${API}/village/${villageId}`,
    {
      headers: authHeader()
    }
  );

  return res.data;

};


/* ================= GET GALLERY IMAGES ================= */

export const getDevelopmentImages = async (id) => {

  const res = await axios.get(
    `${API}/${id}/images`,
    {
      headers: authHeader()
    }
  );

  return res.data;

};


/* ================= GET VIDEO ================= */

export const getDevelopmentVideo = async (id) => {

  const res = await axios.get(
    `${API}/${id}/video`,
    {
      headers: authHeader()
    }
  );

  return res.data;

};


/* ================= GET REPORTS ================= */

export const getDevelopmentReports = async (id) => {

  const res = await axios.get(
    `${API}/${id}/reports`,
    {
      headers: authHeader()
    }
  );

  return res.data;

};


/* ================= UPDATE DEVELOPMENT ================= */

export const updateVillageDevelopment = async (
  villageId,
  developmentId,
  formData
) => {

  const res = await axios.put(
    `${API}/village/${villageId}/${developmentId}`,
    formData,
    {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;

};


/* ================= DELETE DEVELOPMENT ================= */

export const deleteVillageDevelopment = async (id) => {

  const res = await axios.delete(
    `${API}/${id}`,
    {
      headers: authHeader()
    }
  );

  return res.data;

};
