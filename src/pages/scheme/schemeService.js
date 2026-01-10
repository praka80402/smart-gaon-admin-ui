import axios from "axios";

const BASE_URL = "http://localhost:9090/api/admin/schemes";

export const createScheme = (data) => {
  return axios.post(BASE_URL, data);
};

export const getAllSchemes = () => {
  return axios.get(BASE_URL);
};

export const deleteScheme = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const updateScheme = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data);

