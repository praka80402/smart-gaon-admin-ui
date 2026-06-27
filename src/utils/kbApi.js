/**
 * kbApi.js — Knowledge Bank API calls
 *
 * Uses YOUR existing JWT token key from localStorage.
 * Change TOKEN_KEY below if your app uses a different key name.
 */
import axios from 'axios';

const TOKEN_KEY = 'adminToken'; // ← change to your localStorage key, e.g. 'admin_token'
const BASE_URL  = process.env.REACT_APP_API_URL || 'http://localhost:9090';

const kbApi = axios.create({ baseURL: `${BASE_URL}/api/knowledge-bank`, timeout: 30000 });

kbApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

kbApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = '/login';
    return Promise.reject(err);
  }
);

// ── API methods ───────────────────────────────────────────
export const kbGetCategories   = ()       => kbApi.get('/categories');
export const kbGetStats        = ()       => kbApi.get('/stats');
export const kbGetDocuments    = (params) => kbApi.get('/documents', { params });
export const kbGetDocument     = (id)     => kbApi.get(`/documents/${id}`);
export const kbGetDownloadUrl  = (id)     => kbApi.get(`/documents/${id}/download`);
export const kbDeleteDocument  = (id)     => kbApi.delete(`/documents/${id}`);
export const kbGetActivity     = (id)     => kbApi.get(`/documents/${id}/activity`);

export const kbUploadDocument  = (formData, onProgress) =>
  kbApi.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export default kbApi;

// ── Category CRUD ─────────────────────────────────────────
export const kbCreateCategory = (data)       => kbApi.post('/categories', data);
export const kbUpdateCategory = (id, data)   => kbApi.put(`/categories/${id}`, data);
export const kbDeleteCategory = (id)         => kbApi.delete(`/categories/${id}`);
