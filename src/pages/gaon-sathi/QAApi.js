import axios from "axios";

 const QA_BASE = "https://smartgaonadmin.duckdns.org/api/admin/qa";
//  const QA_BASE = "http://localhost:9090/api/admin/qa";

export const uploadQAExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${QA_BASE}/upload`, formData, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const searchQA = async (question) => {
  const res = await axios.get(`${QA_BASE}/search`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
    },
    params: { question },
  });

  return res.data;
};

export const getAllQA = async () => {
  const res = await axios.get(`${QA_BASE}/all`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("adminToken"),
    },
  });

  return res.data;
};