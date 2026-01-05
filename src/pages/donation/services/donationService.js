import axiosInstance from "./axiosInstance";

// ================= PROJECTS =================
export const createDonationProject = (formData) =>
  axiosInstance.post("/projects", formData);

export const getProjectsByLocation = (state, pincode) =>
  axiosInstance.get("/projects/filter", {
    params: { state, pincode },
  });

export const updateDonationProject = (id, data) =>
  axiosInstance.put(`/projects/${id}`, data);

export const deleteDonationProject = (id) =>
  axiosInstance.delete(`/projects/${id}`);

export const getProjectById = (id) =>
  axiosInstance.get(`/projects/${id}`);

// ================= DONATIONS =================

// USER DONATE
export const donate = (data) =>
  axiosInstance.post("/donation", data);

// ADMIN – ALL DONATIONS (dashboard)
export const getAdminDonations = () =>
  axiosInstance.get("/donation/admin");

// ADMIN – PROJECT WISE DONATIONS ✅
export const getAdminDonationsByProject = (projectId) =>
  axiosInstance.get(`/donation/admin/project/${projectId}`);

// ADMIN – VERIFY
export const verifyDonation = (donationId) =>
  axiosInstance.put(`/donation/verify/${donationId}`);

// ================= BADGE =================
export const assignBadge = (data) =>
  axiosInstance.post("/badge", data);
