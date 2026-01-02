import axiosInstance from "./axiosInstance";

// ================= PROJECT =================

export const createDonationProject = (data) =>
  axiosInstance.post("/project", data);

export const getProjectsByLocation = (state, pincode) =>
  axiosInstance.get("/project/filter", {
    params: { state, pincode },
  });


export const updateDonationProject = (id, data) =>
  axiosInstance.put(`/project/${id}`, data);

export const deleteDonationProject = (id) =>
  axiosInstance.delete(`/project/${id}`);

// ================= DONATION =================

export const getDonationsByProject = (projectId) =>
  axiosInstance.get(`/donation/project/${projectId}`);

export const verifyDonation = (donationId) =>
  axiosInstance.put(`/donation/verify/${donationId}`);

// ================= BADGE =================

export const assignBadge = (data) =>
  axiosInstance.post("/badge", data);
