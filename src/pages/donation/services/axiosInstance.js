import axios from "axios";

const axiosInstance = axios.create({
//   baseURL: "https://smartgaonadmin.duckdns.org/api",
baseURL:"http://localhost:9090/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

export default axiosInstance;
