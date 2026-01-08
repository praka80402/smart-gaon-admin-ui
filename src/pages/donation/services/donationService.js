// import axiosInstance from "./axiosInstance";

// // ================= PROJECTS =================
// export const createDonationProject = (formData) =>
//   axiosInstance.post("/projects", formData);

// export const getProjectsByLocation = (state, pincode) =>
//   axiosInstance.get("/projects/filter", {
//     params: { state, pincode },
//   });

// export const updateDonationProject = (id, data) =>
//   axiosInstance.put(`/projects/${id}`, data);

// export const deleteDonationProject = (id) =>
//   axiosInstance.delete(`/projects/${id}`);

// export const getProjectById = (id) =>
//   axiosInstance.get(`/projects/${id}`);

// // ================= DONATIONS =================

// // USER DONATE
// export const donate = (data) =>
//   axiosInstance.post("/donation", data);

// // ADMIN – ALL DONATIONS (dashboard)
// export const getAdminDonations = () =>
//   axiosInstance.get("/donation/admin");

// // ADMIN – PROJECT WISE DONATIONS ✅
// export const getAdminDonationsByProject = (projectId) =>
//   axiosInstance.get(`/donation/admin/project/${projectId}`);

// // ADMIN – VERIFY
// export const verifyDonation = (donationId) =>
//   axiosInstance.put(`/donation/verify/${donationId}`);

// // ================= BADGE =================
// export const assignBadge = (data) =>
//   axiosInstance.post("/badge", data);
import axiosInstance from "./axiosInstance";

// ================= PROJECTS =================

// CREATE PROJECT (multipart/form-data)
export const createDonationProject = (formData) =>
  axiosInstance.post("/projects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET ALL PROJECTS
export const getProjects = () =>
  axiosInstance.get("/projects");

// GET PROJECT BY ID
export const getProjectById = (id) =>
  axiosInstance.get(`/projects/${id}`);

// UPDATE PROJECT (ALL DATA + MEDIA)
export const updateDonationProject = (id, formData) =>
  axiosInstance.put(`/projects/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE PROJECT
export const deleteDonationProject = (id) =>
  axiosInstance.delete(`/projects/${id}`);

// ================= GALLERY =================

// ADD GALLERY IMAGES
export const addGalleryImages = (id, formData) =>
  axiosInstance.post(`/projects/${id}/gallery`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// REMOVE GALLERY IMAGE
export const removeGalleryImage = (id, imageUrl) =>
  axiosInstance.delete(`/projects/${id}/gallery`, {
    params: { imageUrl },
  });

// ================= DONATIONS =================

// USER DONATE
export const donate = (userId, projectId, amount) =>
  axiosInstance.post("/donation", {
    userId,
    projectId,
    amount,
  });

// ADMIN – ALL DONATIONS
export const getAdminDonations = () =>
  axiosInstance.get("/donation/admin");

// ADMIN – PROJECT WISE DONATIONS
export const getAdminDonationsByProject = (projectId) =>
  axiosInstance.get(`/donation/admin/project/${projectId}`);

// ADMIN – VERIFY DONATION
export const verifyDonation = (donationId) =>
  axiosInstance.put(`/donation/verify/${donationId}`);

// ================= BADGE =================

export const assignBadge = (data) =>
  axiosInstance.post("/badge", data);
