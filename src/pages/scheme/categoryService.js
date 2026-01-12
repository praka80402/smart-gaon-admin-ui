import axios from "axios";

const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin/categories";

export const getCategories = () => {
  return axios.get(BASE_URL);
};

export const createCategory = (name) => {
  return axios.post(
    BASE_URL,
    null,
    {
      params: { name },
    }
  );
};
