import axios from "axios";

const NAV_BASE = "https://smartgaonadmin.duckdns.org/admin/navigation";

const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("adminToken"),
});

// ─── MODULE APIs ───────────────────────────────────────────

export const getAllModules = async () => {
  const res = await axios.get(`${NAV_BASE}/module`, { headers: authHeaders() });
  return res.data;
};

export const getModuleByCode = async (moduleCode) => {
  const res = await axios.get(`${NAV_BASE}/module/${moduleCode}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const saveModule = async (moduleData) => {
  const res = await axios.post(`${NAV_BASE}/module`, moduleData, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateModule = async (id, moduleData) => {
  const res = await axios.put(`${NAV_BASE}/module/${id}`, moduleData, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteModule = async (id) => {
  const res = await axios.delete(`${NAV_BASE}/module/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─── ALIAS APIs ───────────────────────────────────────────

export const getAliasesByModule = async (moduleCode) => {
  const res = await axios.get(`${NAV_BASE}/alias/${moduleCode}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getAllAliases = async () => {
  const res = await axios.get(
    `${NAV_BASE}/alias`,
    {
      headers: authHeaders(),
    }
  );

  return res.data;
};

export const saveAlias = async (aliasData) => {
  const res = await axios.post(`${NAV_BASE}/alias`, aliasData, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateAlias = async (id, aliasData) => {
  const res = await axios.put(`${NAV_BASE}/alias/${id}`, aliasData, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteAlias = async (id) => {
  const res = await axios.delete(`${NAV_BASE}/alias/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ─── HYBRID RESOLVE API ────────────────────────────────────

export const resolveNavigation = async (message) => {
  const res = await axios.post(
    `${NAV_BASE}/resolve`,
    { message },
    { headers: authHeaders() }
  );
  return res.data;
};
