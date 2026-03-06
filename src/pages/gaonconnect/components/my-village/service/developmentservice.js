
// ----------------------------------------------------------

import axios from "axios";
import { BASE_URL, authHeader } from "./config";

const API = `${BASE_URL}/admin/development`;
/* ========= MASTER ========= */

export const createMaster = (formData) =>
  axios.post(`${API}/master`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllMasters = () =>
  axios.get(`${API}/master`, {
    headers: authHeader(),
  });

/* ========= DEVELOPMENT ========= */

export const createDevelopment = (formData) =>
  axios.post(API, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllDevelopment = () =>
  axios.get(API, { headers: authHeader() });

export const getByPhase = (phase) =>
  axios.get(`${API}/phase/${phase}`, {
    headers: authHeader(),
  });

export const getProjectById = (id) =>
  axios.get(`${API}/${id}`, {
    headers: authHeader(),
  });

export const updateDevelopment = (id, formData) =>
  axios.put(`${API}/${id}`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteDevelopment = (id) =>
  axios.delete(`${API}/${id}`, {
    headers: authHeader(),
  });