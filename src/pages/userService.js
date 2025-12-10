import axios from "axios";

const BASE = "http://localhost:9090/admin";
const LOGIN_URL = `${BASE}/login`;
const USERS_URL = `${BASE}/users`;

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

  if (res.data?.token) {
    return res.data.token;
  }

  throw new Error("Invalid credentials");
};

// -----------------------------------------------------
// GET all users (SECURED)
// -----------------------------------------------------
export const getAllUsers = async () => {
  return axios
    .get(USERS_URL, authHeader())
    .then((res) => res.data)
    .catch((err) => {
      console.error("GET USERS ERROR →", err);
      throw err;
    });
};

// -----------------------------------------------------
// SEARCH user by phone (SECURED)
// -----------------------------------------------------
export const getUserByPhone = async (phone) => {
  const res = await axios.get(
    `${USERS_URL}/search?phone=${phone}`,
    authHeader()
  );
  return res.data;
};

// -----------------------------------------------------
// DELETE user by ID (SECURED)
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
