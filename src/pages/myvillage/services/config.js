import axios from "axios";
import api from "../../../services/axiosInstance";

// ── Backend host ──
export const BASE_URL = "https://smartgaonadmin.duckdns.org";

// Look for a JWT under the common key names apps use.
// Whichever one your login actually sets will be picked up.
function findToken() {
  const keys = [
    "token",
    "adminToken",
    "accessToken",
    "authToken",
    "jwt",
    "jwtToken",
    "access_token",
    "Authorization",
  ];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function authHeader() {
  const token = findToken();
  if (!token) return {};
  // If the stored value already includes "Bearer ", don't double it.
  return { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` };
}

export { api };

// ── base64 helpers ──
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function filesToBase64(files) {
  const arr = Array.from(files || []);
  return Promise.all(arr.map(fileToBase64));
}