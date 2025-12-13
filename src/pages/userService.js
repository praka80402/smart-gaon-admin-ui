import axios from "axios";

const BASE = "https://smartgaon.duckdns.org/admin/admin";
const LOGIN_URL = `${BASE}/login`;
const USERS_URL = `${BASE}/users`;
const ADMINS_URL = `${BASE}/all`;
const CREATE_ADMIN_URL = `${BASE}/create`;

// -----------------------------------------------------
// AUTH HEADER
// -----------------------------------------------------
const authHeader = () => ({
  headers: {
    Authorization: "Bearer " + localStorage.getItem("adminToken"),
  },
});

// -----------------------------------------------------
// LOGIN — returns token string
// -----------------------------------------------------
export const loginAdmin = async (email, password) => {
  const res = await axios.post(LOGIN_URL, { email, password });

  console.log("LOGIN RESPONSE:", res.data);  // DEBUG

  return {
    token: res.data.token,
    role: res.data.role,
    state: res.data.state,
    district: res.data.district
  };
};


// -----------------------------------------------------
// GET all users (SECURED)
// -----------------------------------------------------
export const getAllUsers = async () => {
  try {
    const res = await axios.get(USERS_URL, authHeader());
    return res.data;
  } catch (err) {
    console.error("GET USERS ERROR →", err);
    throw err;
  }
};

// -----------------------------------------------------
// SEARCH user by phone
// -----------------------------------------------------
export const getUserByPhone = async (phone) => {
  const res = await axios.get(`${USERS_URL}/search?phone=${phone}`, authHeader());
  return res.data;
};

// -----------------------------------------------------
// DELETE user
// -----------------------------------------------------
export const deleteUserById = async (id) => {
  return axios.delete(`${USERS_URL}/${id}`, authHeader());
};

// -----------------------------------------------------
// UPDATE USER (EDIT)
// -----------------------------------------------------
export const updateUserById = async (id, updatedData) => {
  return axios.put(`${USERS_URL}/${id}`, updatedData, authHeader());
};

// -----------------------------------------------------
// ENABLE USER
// -----------------------------------------------------
export const enableUser = async (id) => {
  return axios.put(`${USERS_URL}/${id}/enable`, {}, authHeader());
};

// -----------------------------------------------------
// DISABLE USER
// -----------------------------------------------------
export const disableUser = async (id) => {
  return axios.put(`${USERS_URL}/${id}/disable`, {}, authHeader());
};

// -----------------------------------------------------
// GET ALL ADMINS – ONLY SUPER ADMIN CAN CALL
// -----------------------------------------------------
export const getAllAdmins = async () => {
  const res = await axios.get(ADMINS_URL, authHeader());
  return res.data;
};

// -----------------------------------------------------
// CREATE NEW ADMIN (SUPER ADMIN / STATE ADMIN)
// -----------------------------------------------------
export const createAdmin = async (adminData) => {
  const res = await axios.post(CREATE_ADMIN_URL, adminData, authHeader());
  return res.data;
};
