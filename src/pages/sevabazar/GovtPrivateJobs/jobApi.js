import { api } from "../../gaonconnect/services/apiConfig";

const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin/alljobs";
// const BASE_URL = "http://localhost:9090/api/admin/alljobs";


const authHeader = () => ({
  headers: {
    Authorization: "Bearer " + localStorage.getItem("adminToken"),
  },
});


export const getAllJobs = async () => {
  const res = await api.get(BASE_URL, authHeader());
  return res.data;
};

export const createJob = async (data) => {
  const res = await api.post(BASE_URL, data, authHeader());
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await api.delete(`${BASE_URL}/${id}`, authHeader());
  return res.data;
};