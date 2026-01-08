/* =======================
   BASE CONFIG
======================= */
const BASE_URL = "http://localhost:9090";

/* =======================
   API CALLS
======================= */

// GET all success stories
export const fetchSuccessStories = async () => {
  const res = await fetch(`${BASE_URL}/api/success-stories`);
  return res.json();
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

  const res = await fetch(`${BASE_URL}/api/success-stories`, {
    method: "POST",
    body: fd,
  });

  return res.json();
};

// EDIT success story (image optional)
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

  const res = await fetch(`${BASE_URL}/api/success-stories/${id}`, {
    method: "PUT",
    body: fd,
  });

  return res.json();
};

// DELETE success story
export const deleteSuccessStory = async (id) => {
  await fetch(`${BASE_URL}/api/success-stories/${id}`, {
    method: "DELETE",
  });
};
