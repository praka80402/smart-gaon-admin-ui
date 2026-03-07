// src/services/apiConfig.js

//  export const BASE_URL = "http://localhost:9090";
  export const BASE_URL = "https://smartgaonadmin.duckdns.org";

export const authHeader = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: "Bearer " + token,
  };
};