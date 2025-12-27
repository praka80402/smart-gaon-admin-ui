import { api } from "./apiConfig";

export const getAllDirectoryUsers = () => api.get(`/admin/users`);
export const getDirectoryUsersByPincode = (pin) =>
  api.get(`/admin/users/by-pincode/${pin}`);
export const addDirectoryUser = (data) =>
  api.post(`/admin/users/add-directory`, data);
export const updateDirectoryUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);
export const deleteDirectoryUser = (id) =>
  api.delete(`/admin/users/${id}`);
