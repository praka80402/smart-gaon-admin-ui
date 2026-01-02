import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://smartgaonadmin.duckdns.org/api/donation",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
