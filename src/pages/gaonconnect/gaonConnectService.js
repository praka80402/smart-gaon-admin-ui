// src/pages/gaonconnect/gaonConnectService.js
import axios from "axios";

const ADMIN_BASE = "http://localhost:9090/admin";

// ---------------- API BASE ----------------
export const NEWS_URL = `${ADMIN_BASE}/news`;
export const EVENTS_URL = `${ADMIN_BASE}/events`;

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

  // JSON data part
  form.append(
    "news",
    new Blob([JSON.stringify(news)], { type: "application/json" })
  );

  // append up to 5 images (backend expects "images")
  images.forEach((img) => {
    if (img) form.append("images", img);
  });

  if (video) form.append("video", video);

  return axios.post(`${NEWS_URL}/upload`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ---------- UPDATE NEWS WITH MEDIA (upload-multiple) ---------- */
export const updateNewsWithMedia = async (
  id,
  news,
  newImages = [],
  newVideo = null,
  removedImageUrls = []
) => {
  const form = new FormData();

  // JSON part
  form.append(
    "news",
    new Blob([JSON.stringify(news)], { type: "application/json" })
  );

  newImages.forEach((img) => {
    if (img) form.append("images", img);
  });

  if (newVideo) form.append("video", newVideo);

  // backend expects a JSON array string for removedImageUrls
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

/* ---------- EVENT CREATE WITH MULTIPLE IMAGES + VIDEO ---------- */
export const createEventWithMedia = async (event, images = [], video = null) => {
  const form = new FormData();

  Object.keys(event).forEach((k) => {
    if (event[k] !== undefined && event[k] !== null) form.append(k, event[k]);
  });

  images.forEach((img) => {
    if (img) form.append("images", img);
  });

  if (video) form.append("video", video);

  return axios.post(`${EVENTS_URL}/upload`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ---------- EVENT UPDATE WITH MEDIA (upload-multiple) ---------- */
// NOTE: backend expects PUT /admin/events/upload-multiple/{id}
export const updateEventWithMedia = async (
  id,
  event,
  images = [],
  video = null,
  removedImageUrls = []
) => {
  const form = new FormData();

  Object.keys(event).forEach((k) => {
    if (event[k] !== undefined && event[k] !== null) form.append(k, event[k]);
  });

  images.forEach((img) => {
    if (img) form.append("images", img);
  });

  if (video) form.append("video", video);

  form.append("removedImageUrls", JSON.stringify(removedImageUrls || []));

  return axios.put(`${EVENTS_URL}/upload-multiple/${id}`, form, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });
};
