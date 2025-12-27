import { api } from "./apiConfig";

export const getAllNews = (page, size) =>
  api.get(`/admin/news`, { params: { page, size } });

export const createNewsWithImage = (news, images, video) => {
  const f = new FormData();
  f.append("news", new Blob([JSON.stringify(news)], { type: "application/json" }));
  images.forEach((i) => f.append("images", i));
  if (video) f.append("video", video);
  return api.post(`/admin/news/upload`, f);
};

export const updateNews = (id, news) => api.put(`/admin/news/${id}`, news);

export const updateNewsWithMedia = (id, news, imgs, video, removed) => {
  const f = new FormData();
  f.append("news", new Blob([JSON.stringify(news)], { type: "application/json" }));
  imgs.forEach((i) => f.append("images", i));
  if (video) f.append("video", video);
  f.append("removedImageUrls", JSON.stringify(removed));
  return api.put(`/admin/news/upload-multiple/${id}`, f);
};

export const deleteNews = (id) => api.delete(`/admin/news/${id}`);
