import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://smartgaonadmin.duckdns.org/admin/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
