import { api } from "../../pages/gaonconnect/services/apiConfig";

// baseURL already = https://smartgaonadmin.duckdns.org
const BASE = "/api/admin/schemes";

const fetchSchemesPage = (page = 0) => {
  return api.get(BASE, {
    params: {
      page,
      size: 1000,
    },
  });
};

// ---------------- CREATE ----------------
export const createScheme = (data) => {
  return api.post(BASE, data);
};

// ---------------- GET ALL ----------------
export const getAllSchemes = () => {
  return fetchSchemesPage(0).then(async (firstResponse) => {
    const firstData = firstResponse.data;

    if (Array.isArray(firstData)) {
      return firstResponse;
    }

    const firstPageContent = Array.isArray(firstData?.content) ? firstData.content : [];
    const totalPages = Number(firstData?.totalPages) || 1;

    if (totalPages <= 1) {
      return {
        ...firstResponse,
        data: firstPageContent,
      };
    }

    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => fetchSchemesPage(index + 1))
    );

    const allSchemes = [
      ...firstPageContent,
      ...remainingResponses.flatMap((response) =>
        Array.isArray(response.data?.content) ? response.data.content : []
      ),
    ];

    return {
      ...firstResponse,
      data: allSchemes,
    };
  });
};

// ---------------- DELETE ----------------
export const deleteScheme = (id) => {
  return api.delete(`${BASE}/${id}`);
};

// ---------------- UPDATE ----------------
export const updateScheme = (id, data) => {
  return api.put(`${BASE}/${id}`, data);
};
