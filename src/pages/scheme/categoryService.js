import axios from "axios";

const BASE_URL = "http://localhost:9090/api/admin/categories";

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
