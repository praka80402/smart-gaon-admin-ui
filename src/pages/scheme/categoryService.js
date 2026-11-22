import { api } from "../../pages/gaonconnect/services/apiConfig";

const BASE_URL = "/api/admin/categories";

export const getCategories = (lang) => {
  return api.get(BASE_URL, {
    params: lang ? { lang } : {},
  });
};

// translations: { HI: "कृषि", MR: "शेती" }  (optional)
export const createCategory = (name, translations = {}) => {
  return api.post(
    BASE_URL,
    null,
    {
      params: { name, translations: JSON.stringify(translations) },
    }
  );
};

export const updateCategory = (id, name, translations = {}) => {
  return api.put(
    `${BASE_URL}/${id}`,
    null,
    {
      params: { name, translations: JSON.stringify(translations) },
    }
  );
};

export const deleteCategory = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};
