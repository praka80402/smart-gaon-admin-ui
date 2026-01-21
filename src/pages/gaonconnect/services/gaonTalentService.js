import { api } from "../../gaonconnect/services/apiConfig";

// baseURL is already: https://smartgaonadmin.duckdns.org
const BASE = "/admin/gaon-talent";

// ---------------------- Competitions ----------------------
export const getAllCompetitions = () =>
  api.get(`${BASE}/competition/all`);

export const createCompetition = (data) =>
  api.post(`${BASE}/competition`, data);

export const getCompetitionEntries = (competitionId) =>
  api.get(`${BASE}/competition/${competitionId}/entries`);

export const getCompetitionByCategory = (category) =>
  api.get(`${BASE}/competition/category`, {
    params: { category }
  });

// ---------------------- Entries ----------------------
export const getEntriesByCategory = (category) =>
  api.get(`${BASE}/entries`, {
    params: { category }
  });

// ---------------------- Likes ----------------------
export const getLikes = (entryId) =>
  api.get(`${BASE}/likes/${entryId}`);

// ---------------------- Comments ----------------------
export const getComments = (entryId) =>
  api.get(`${BASE}/comments/${entryId}`);

// ---------------------- Winner ----------------------
export const declareWinner = (entryId) =>
  api.post(`${BASE}/winner/${entryId}`);
