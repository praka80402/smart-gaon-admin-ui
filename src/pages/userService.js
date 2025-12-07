// src/services/userService.js
import axios from "axios";

const BASE = "http://localhost:9090/admin";
const LOGIN_URL = `${BASE}/login`;
const USERS_URL = `${BASE}/users`;

// LOGIN — backend returns plain string ("Admin Login Successful")
export const loginAdmin = async (email, password) => {
  const res = await axios.post(LOGIN_URL, { email, password });

  if (res.data === "Admin Login Successful") {
    // Return true, no token
    return true;
  } else {
    throw new Error("Invalid credentials");
  }
};

// GET all users
export const getAllUsers = async () => {
  const res = await axios.get(USERS_URL);
  return res.data;
};

// SEARCH user by phone (client-side filter)
export const getUserByPhone = async (phone) => {
  const users = await getAllUsers();
  const user = users.find((u) => u.phone === phone);

  if (!user) throw new Error("User not found");
  return user;
};

// DELETE user by ID
export const deleteUserById = async (id) => {
  return axios.delete(`${USERS_URL}/${id}`);
};
