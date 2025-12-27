import axios from "axios";

const API = "http://localhost:9090/admin/gaon-talent";

// ---------------------- Competitions ----------------------
export const getAllCompetitions = () =>
  axios.get(`${API}/competition/all`);

export const createCompetition = (data) =>
  axios.post(`${API}/competition`, data);

export const getCompetitionEntries = (competitionId) =>
  axios.get(`${API}/competition/${competitionId}/entries`);

export const getCompetitionByCategory = (category) =>
  axios.get(`${API}/competition/category?category=${category}`);


// ---------------------- Entries ----------------------
export const getEntriesByCategory = (category) =>
  axios.get(`${API}/entries?category=${category}`);


// ---------------------- Likes ----------------------
export const getLikes = (entryId) =>
  axios.get(`${API}/likes/${entryId}`);


// ---------------------- Comments ----------------------
export const getComments = (entryId) =>
  axios.get(`${API}/comments/${entryId}`);


// ---------------------- Winner ----------------------
export const declareWinner = (entryId) =>
  axios.post(`${API}/winner/${entryId}`);
