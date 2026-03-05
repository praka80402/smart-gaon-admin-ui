// import axios from "axios";

//  const BASE_URL = "http://localhost:9090/admin/development";
// // const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/development";

// const authHeader = () => {
//   const token = localStorage.getItem("adminToken");
//   return {
//     Authorization: "Bearer " + token,
//   };
// };

// export const createDevelopment = (formData) =>
//   axios.post(BASE_URL, formData, {
//     headers: {
//       ...authHeader(),
//       "Content-Type": "multipart/form-data",
//     },
//   });

// export const getAllDevelopment = () =>
//   axios.get(BASE_URL, { headers: authHeader() });

// export const getByPhase = (phaseNumber) =>
//   axios.get(`${BASE_URL}/phase/${phaseNumber}`, {
//     headers: authHeader(),
//   });

// export const deleteDevelopment = (id) =>
//   axios.delete(`${BASE_URL}/${id}`, {
//     headers: authHeader(),
//   });

//   export const updateDevelopment = (id, formData) =>
//   axios.put(`${BASE_URL}/${id}`, formData, {
//     headers: {
//       ...authHeader(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
// ----------------------------------------------------------

import axios from "axios";

// const BASE_URL = "http://localhost:9090/admin/development";
const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/development"

const authHeader = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: "Bearer " + token,
  };
};

/* ========= MASTER ========= */

export const createMaster = (formData) =>
  axios.post(`${BASE_URL}/master`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllMasters = () =>
  axios.get(`${BASE_URL}/master`, {
    headers: authHeader(),
  });

/* ========= DEVELOPMENT ========= */

export const createDevelopment = (formData) =>
  axios.post(BASE_URL, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllDevelopment = () =>
  axios.get(BASE_URL, { headers: authHeader() });

export const getByPhase = (phase) =>
  axios.get(`${BASE_URL}/phase/${phase}`, {
    headers: authHeader(),
  });

export const getProjectById = (id) =>
  axios.get(`${BASE_URL}/${id}`, {
    headers: authHeader(),
  });

export const updateDevelopment = (id, formData) =>
  axios.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteDevelopment = (id) =>
  axios.delete(`${BASE_URL}/${id}`, {
    headers: authHeader(),
  });