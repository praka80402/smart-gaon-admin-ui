
// import {api} from "../../gaonconnect/services/apiConfig";

// // ================= PROJECTS =================

// // CREATE PROJECT (multipart/form-data)
// export const createDonationProject = (formData) =>
//   api.post("/api/projects", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// // GET ALL PROJECTS
// // export const getProjects = () =>
// //   api.get("/api/projects");

// export const getProjects = (page = 0, size = 5) => {
//   return api.get(`/api/projects?page=${page}&size=${size}`);
// };

// // GET PROJECT BY ID
// export const getProjectById = (id) =>
//   api.get(`/api/projects/${id}`);

// // UPDATE PROJECT (ALL DATA + MEDIA)
// export const updateDonationProject = (id, formData) =>
//   api.put(`/api/projects/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// // DELETE PROJECT
// export const deleteDonationProject = (id) =>
//   api.delete(`/api/projects/${id}`);

// // ================= GALLERY =================

// // ADD GALLERY IMAGES
// export const addGalleryImages = (id, formData) =>
//   api.post(`/api/projects/${id}/gallery`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// // REMOVE GALLERY IMAGE
// export const removeGalleryImage = (id, imageUrl) =>
//   api.delete(`/api/projects/${id}/gallery`, {
//     params: { imageUrl },
//   });

// // ================= DONATIONS =================

// // USER DONATE
// export const donate = (userId, projectId, amount) =>
//   api.post("/api/donation", {
//     userId,
//     projectId,
//     amount,
//   });

// // ADMIN – ALL DONATIONS
// export const getAdminDonations = () =>
//   api.get("/api/donation/admin");

// // ADMIN – PROJECT WISE DONATIONS
// export const getAdminDonationsByProject = (projectId) =>
//   api.get(`/api/donation/admin/project/${projectId}`);

// // ADMIN – VERIFY DONATION
// export const verifyDonation = (donationId) =>
//   api.put(`/api/donation/verify/${donationId}`);

// // ================= BADGE =================

// // export const assignBadge = (data) =>
// //   api.post("/badge", data);
// export const assignBadge = (userId, badgeName) =>
//   api.post(
//     "/api/badge",
//     null,
//     {
//       params: {
//         userId,
//         badgeName,
//       },
//     }
//   );