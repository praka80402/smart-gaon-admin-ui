import { api } from "../../pages/gaonconnect/services/apiConfig";

const BASE_URL = "/api/admin/categories";

export const getCategories = () => {
  return api.get(BASE_URL);
};

export const createCategory = (name) => {
  return api.post(
    BASE_URL,
    null,
    {
      params: { name },
    }
  );
};

export const updateCategory = (id, name) => {
  return api.put(
    `${BASE_URL}/${id}`,
    null,
    {
      params: { name },
    }
  );
};

export const deleteCategory = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};
