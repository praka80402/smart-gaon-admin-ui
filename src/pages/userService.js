import { api } from "../pages/gaonconnect/services/apiConfig"
           const BASE = "https://smartgaonadmin.duckdns.org/admin";
//const BASE = "http://localhost:9090/admin";

const LOGIN_URL = `${BASE}/login`;
const USERS_URL = `${BASE}/users`;
const ADMINS_URL = `${BASE}/user/visible`;
const CREATE_ADMIN_URL = `${BASE}/user/create`;

// -----------------------------------------------------
// AUTH HEADER
// -----------------------------------------------------
const authHeader = () => ({
headers: {
Authorization: "Bearer " + localStorage.getItem("adminToken"),
},
});

// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------
export const loginAdmin = async (email, password) => {
const res = await api.post(LOGIN_URL, { email, password });

return {
token: res.data.token,
role: res.data.role,
email: res.data.email
};
};

// -----------------------------------------------------
// LOAD LOGGED ADMIN PROFILE (state/district/pincode/school)
// -----------------------------------------------------
export const loadMyAdminProfile = async (token, email) => {
  const res = await api.get(ADMINS_URL, {
    headers: { Authorization: "Bearer " + token }
  });

  const me = res.data.find(a => a.email === email);

  if (me) {
    localStorage.setItem("adminName", me.name || "");
    localStorage.setItem("adminState", me.state || "");
    localStorage.setItem("adminDistrict", me.district || "");
    localStorage.setItem("adminPincode", me.pincode || "");
    localStorage.setItem("adminSchool", me.school || ""); 
  }
};

// -----------------------------------------------------
// USERS
// -----------------------------------------------------
export const getAllUsers = async () => {
const res = await api.get(USERS_URL, authHeader());
return res.data;
};

export const deleteUserById = async (id) =>
api.delete(`${USERS_URL}/${id}`, authHeader());

export const updateUserById = async (id, updatedData) =>
api.put(`${USERS_URL}/${id}`, updatedData, authHeader());

export const enableUser = async (id) =>
api.put(`${USERS_URL}/${id}/enable`, {}, authHeader());

export const disableUser = async (id) =>
api.put(`${USERS_URL}/${id}/disable`, {}, authHeader());

// -----------------------------------------------------
// ADMINS
// -----------------------------------------------------
export const getAllAdmins = async () => {
const res = await api.get(ADMINS_URL, authHeader());
return res.data;
};

export const createAdmin = async (adminData) => {
const res = await api.post(CREATE_ADMIN_URL, adminData, authHeader());
return res.data;
};

// -----------------------------------------------------
// SEARCH
// -----------------------------------------------------
export const searchUsers = async (phone, state) => {
const res = await api.get(`${USERS_URL}/search?phone=${phone}&state=${state}`, authHeader());
return res.data;
};

export const getUsersByPincode = async (pincode) => {
const res = await api.get(`${USERS_URL}/by-pincode/${pincode}`, authHeader());
return res.data;
};

export const getUserCount = async () => {
const res = await api.get(`${USERS_URL}/count`, authHeader());
return res.data;
};

/* -----------------------------------------------------
SCHOOL ADMIN — School Competition scoped admin
----------------------------------------------------- */

// Schools available for the "Add School Admin" dropdown
// (same master list used by AdminCompetitionManager)
export const getSchoolsForCompetition = async () => {
  const res = await api.get(`${BASE}/school-competitions/schools`, authHeader());
  return res.data;
};

// Create a SCHOOL_ADMIN (reuses the generic create-admin endpoint,
// backend enforces role-specific validation)
export const createSchoolAdmin = async (schoolAdminData) => {
  const payload = { ...schoolAdminData, role: "SCHOOL_ADMIN" };
  const res = await api.post(CREATE_ADMIN_URL, payload, authHeader());
  return res.data;
};

// Entries visible to the logged-in SCHOOL_ADMIN only.
// Backend scopes this by the admin's own token — no school param sent.
export const getSchoolCompetitionSubmissions = async () => {
  const res = await api.get(`${BASE}/school-competitions/submissions/my-school`, authHeader());
  return res.data;
};
// Reject a submission — SCHOOL_ADMIN scoped. Backend should verify the
// submission belongs to the requesting admin's own school before rejecting.
export const rejectCompetitionSubmission = async (submissionId, reason) => {
  const res = await api.post(
    `${BASE}/school-competitions/submissions/${submissionId}/reject`,
    { reason },
    authHeader()
  );
  return res.data;
};
/* -----------------------------------------------------
VILLAGE APIs (FOR MyVillage.jsx)
----------------------------------------------------- */

export const searchVillages = async ({ page, size, name, city, state }) => {
const res = await api.get(`${BASE}/villages/search`, {
headers: {
Authorization: "Bearer " + localStorage.getItem("adminToken"),
},
params: {
...(page !== undefined && { page }),
...(size !== undefined && { size }),
...(name && { name }),
...(city && { city }),
...(state && { state }),
},
});

return res.data;
};

export const createVillage = async ({ name, city, state, description, images }) => {
const fd = new FormData();
fd.append("name", name);
fd.append("city", city);
fd.append("state", state);
fd.append("description", description);

images.forEach((img) => fd.append("images", img));

const res = await api.post(`${BASE}/villages/upload`, fd, {
headers: {
Authorization: "Bearer " + localStorage.getItem("adminToken"),
"Content-Type": "multipart/form-data",
},
});

return res.data;
};

export const deleteVillage = async (id) => {
const res = await api.delete(`${BASE}/villages/${id}`, {
headers: {
Authorization: "Bearer " + localStorage.getItem("adminToken"),
},
});

return res.data;
};