import { api } from "./apiConfig";

export const getAllEvents = (page, size) =>
  api.get(`/admin/events`, { params: { page, size } });

export const createEventWithMedia = (event, images, video) => {
  const f = new FormData();
  Object.keys(event).forEach((k) => f.append(k, event[k]));
  images.forEach((i) => f.append("images", i));
  if (video) f.append("video", video);
  return api.post(`/admin/events/upload`, f);
};

export const updateEvent = (id, data) => api.put(`/admin/events/${id}`, data);

export const updateEventWithMedia = (id, event, images, video, removed) => {
  const f = new FormData();
  Object.keys(event).forEach((k) => f.append(k, event[k]));
  images.forEach((i) => f.append("images", i));
  if (video) f.append("video", video);
  f.append("removedImageUrls", JSON.stringify(removed));
  return api.put(`/admin/events/upload-multiple/${id}`, f);
};

export const deleteEvent = (id) => api.delete(`/admin/events/${id}`);
