// src/pages/gaonconnect/gaonConnectService.js
import axios from "axios";

const ADMIN_BASE = "https://smartgaonadmin.duckdns.org/admin";

// ---------------- API BASE ----------------
export const NEWS_URL = `${ADMIN_BASE}/news`;
export const EVENTS_URL = `${ADMIN_BASE}/events`;
export const FORUM_URL = `${ADMIN_BASE}/forum`;

// ---------------- AUTH HEADER -------------
const authHeader = () => ({
  headers: {
    Authorization: "Bearer " + localStorage.getItem("adminToken"),
  },
});

// ============================================================
//                           NEWS
// ============================================================

export const createNews = (news) =>
  axios.post(NEWS_URL, news, authHeader());

export const getAllNews = (page = 0, size = 20) =>
  axios.get(NEWS_URL, { ...authHeader(), params: { page, size } });

export const updateNews = (id, news) =>
  axios.put(`${NEWS_URL}/${id}`, news, authHeader());

export const deleteNews = (id) =>
  axios.delete(`${NEWS_URL}/${id}`, authHeader());

/* ---------- NEWS WITH MULTIPLE IMAGES + VIDEO ---------- */
export const createNewsWithImage = async (news, images = [], video = null) => {
  const form = new FormData();
  form.append("news", new Blob([JSON.stringify(news)], { type: "application/json" }));
  images.forEach((img) => img && form.append("images", img));
  if (video) form.append("video", video);

  return axios.post(`${NEWS_URL}/upload`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateNewsWithMedia = async (
  id,
  news,
  newImages = [],
  newVideo = null,
  removedImageUrls = []
) => {
  const form = new FormData();
  form.append("news", new Blob([JSON.stringify(news)], { type: "application/json" }));

  newImages.forEach((img) => img && form.append("images", img));
  if (newVideo) form.append("video", newVideo);

  form.append("removedImageUrls", JSON.stringify(removedImageUrls || []));

  return axios.put(`${NEWS_URL}/upload-multiple/${id}`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================================================
//                           EVENTS
// ============================================================

export const getAllEvents = (page = 0, size = 20) =>
  axios.get(EVENTS_URL, { ...authHeader(), params: { page, size } });

export const createEvent = (event) =>
  axios.post(EVENTS_URL, event, authHeader());

export const updateEvent = (id, event) =>
  axios.put(`${EVENTS_URL}/${id}`, event, authHeader());

export const deleteEvent = (id) =>
  axios.delete(`${EVENTS_URL}/${id}`, authHeader());

export const createEventWithMedia = async (event, images = [], video = null) => {
  const form = new FormData();

  Object.keys(event).forEach((k) => event[k] !== undefined && form.append(k, event[k]));
  images.forEach((img) => img && form.append("images", img));
  if (video) form.append("video", video);

  return axios.post(`${EVENTS_URL}/upload`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateEventWithMedia = async (
  id,
  event,
  images = [],
  video = null,
  removedImageUrls = []
) => {
  const form = new FormData();

  Object.keys(event).forEach((k) => event[k] !== undefined && form.append(k, event[k]));
  images.forEach((img) => img && form.append("images", img));
  if (video) form.append("video", video);

  form.append("removedImageUrls", JSON.stringify(removedImageUrls || []));

  return axios.put(`${EVENTS_URL}/upload-multiple/${id}`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================================================
//                           FORUM
// ============================================================

export const getAllForumPosts = (params = {}) =>
  axios.get(`${FORUM_URL}/list`, {
    ...authHeader(),
    params,
  });

export const deleteForumPost = (postId) =>
  axios.delete(`${FORUM_URL}/${postId}`, authHeader());
// villagedirectory
export const getAllDirectoryUsers = () =>
  axios.get(`${ADMIN_BASE}/users`, authHeader());

export const getDirectoryUsersByPincode = (pincode) =>
  axios.get(`${ADMIN_BASE}/users/by-pincode/${pincode}`, authHeader());

export const addDirectoryUser = (data) =>
  axios.post(`${ADMIN_BASE}/users/add-directory`, data, authHeader());

export const updateDirectoryUser = (id, data) =>
  axios.put(`${ADMIN_BASE}/users/${id}`, data, authHeader());

export const deleteDirectoryUser = (id) =>
  axios.delete(`${ADMIN_BASE}/users/${id}`, authHeader());
