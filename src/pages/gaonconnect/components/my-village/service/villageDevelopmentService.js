import axios from "axios";

const BASE_URL = "http://localhost:9090/admin/village-development";

const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("adminToken"),
});

// ================= ASSIGN DEVELOPMENT =================
export const assignDevelopmentToVillage = async ({
  villageId,
  developmentId,
  progress,
  remarks,
  images
}) => {

  const formData = new FormData();

  formData.append("villageId", villageId);
  formData.append("developmentId", developmentId);
  formData.append("progress", progress);
  formData.append("remarks", remarks || "");

  if (images) {
    images.forEach(img => formData.append("images", img));
  }

  const res = await axios.post(BASE_URL, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ================= GET BY VILLAGE =================
export const getVillageDevelopments = async (villageId) => {
  const res = await axios.get(
    `${BASE_URL}/village/${villageId}`,
    {
      headers: authHeader(),
    }
  );
  return res.data;
};

// ================= UPDATE PROGRESS =================
export const updateVillageDevelopment = async (
  id,
  progress,
  remarks
) => {
  const res = await axios.put(
    `${BASE_URL}/${id}`,
    null,
    {
      headers: authHeader(),
      params: {
        progress,
        remarks
      }
    }
  );
  return res.data;
};



// ================= DELETE =================
export const deleteVillageDevelopment = async (id) => {
  await axios.delete(
    `${BASE_URL}/${id}`,
    {
      headers: authHeader(),
    }
  );

  
};