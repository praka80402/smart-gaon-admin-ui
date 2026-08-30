import api from "../../services/axiosInstance";

// /* =======================
//    BASE CONFIG
// ======================= */

// GET all success stories
export const fetchSuccessStories = async () => {
  const res = await api.get("/api/success-stories");
  return res.data;
};

// CREATE success story
export const createSuccessStory = async (form) => {
  const fd = new FormData();
  fd.append("title", form.title);
  fd.append("userName", form.userName);
  fd.append("story", form.story);
  fd.append("state", form.state);
  fd.append("pincode", form.pincode);
  fd.append("profileImage", form.profileImage);

  const res = await api.post("/api/success-stories", fd);
  return res.data;
};

// EDIT success story
export const updateSuccessStory = async (id, form) => {
  const fd = new FormData();
  fd.append("title", form.title);
  fd.append("userName", form.userName);
  fd.append("story", form.story);
  fd.append("state", form.state);
  fd.append("pincode", form.pincode);

  if (form.profileImage) {
    fd.append("profileImage", form.profileImage);
  }

  const res = await api.put(`/api/success-stories/${id}`, fd);
  return res.data;
};

// DELETE success story
export const deleteSuccessStory = async (id) => {
  await api.delete(`/api/success-stories/${id}`);
};