import axios from "axios";

const ADMIN_BASE = "https://smart-gaon-admin-api.onrender.com/admin";

export const NEWS_URL = `${ADMIN_BASE}/news`;
export const EVENTS_URL = `${ADMIN_BASE}/events`;

/* ---------------------- NEWS CRUD ---------------------- */
export const createNews = (news) => axios.post(NEWS_URL, news);
export const getAllNews = (page = 0, size = 20) =>
  axios.get(NEWS_URL, { params: { page, size } });
export const updateNews = (id, news) => axios.put(`${NEWS_URL}/${id}`, news);
export const deleteNews = (id) => axios.delete(`${NEWS_URL}/${id}`);

/* 🔥 NEWS Upload (JSON + Image multipart) */
export const createNewsWithImage = async (news, file) => {
  const formData = new FormData();
  formData.append("news", new Blob([JSON.stringify(news)], { type: "application/json" }));
  if (file) formData.append("thumbnail", file);

  return axios.post(`${NEWS_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ---------------------- EVENTS CRUD ---------------------- */
export const createEvent = (event) => axios.post(EVENTS_URL, event);
export const getAllEvents = (page = 0, size = 20) =>
  axios.get(EVENTS_URL, { params: { page, size } });
export const updateEvent = (id, event) =>
  axios.put(`${EVENTS_URL}/${id}`, event);
export const deleteEvent = (id) => axios.delete(`${EVENTS_URL}/${id}`);

/* 🔥 EVENT Upload (Fields + Image multipart) */
export const createEventWithImage = async (event, file) => {
  const form = new FormData();

  form.append("title", event.title);
  form.append("description", event.description);
  form.append("startDateTime", event.startDateTime);
  form.append("endDateTime", event.endDateTime);
  form.append("location", event.location);
  form.append("contactInfo", event.contactInfo);

  if (file) form.append("image", file);

  return axios.post(`${EVENTS_URL}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
