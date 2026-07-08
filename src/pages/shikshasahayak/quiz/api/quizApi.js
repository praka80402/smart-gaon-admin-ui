const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";
// const BASE_URL = "http://localhost:9090/api/admin";
 
const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("adminToken"),
});
 
/* ===================================================== */
/* ================= QUESTIONS ========================= */
/* ===================================================== */
 
/** Bulk Excel upload. Returns {inserted, duplicatesSkipped, invalidRowsSkipped, message} */
export const uploadQuestionsExcel = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/questions/upload`, {
    method: "POST",
    headers: authHeader(), // NOTE: no Content-Type — browser sets multipart boundary
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload questions");
  return res.json();
};
 
/** Add a single question. */
export const createQuestion = async (question) => {
  const res = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(question),
  });
  if (!res.ok) throw new Error("Failed to create question");
  return res.json();
};
 
/** List questions by segment. segmentType = "ACADEMIC" | "COMPETITION" */
export const getQuestions = async (segmentType) => {
  const res = await fetch(`${BASE_URL}/questions?segmentType=${segmentType}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load questions");
  return res.json();
};
 
export const updateQuestion = async (id, question) => {
  const res = await fetch(`${BASE_URL}/questions/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(question),
  });
  if (!res.ok) throw new Error("Failed to update question");
  return res.json();
};
 
export const deleteQuestion = async (id) => {
  const res = await fetch(`${BASE_URL}/questions/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete question");
  return res.text();
};
 
export const publishQuestion = async (id) => {
  const res = await fetch(`${BASE_URL}/questions/${id}/publish`, {
    method: "PUT",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to publish question");
  return res.json();
};
 
/* ================= DUPLICATES ================= */
 
export const findDuplicates = async (segmentType, subject) => {
  const res = await fetch(
    `${BASE_URL}/questions/duplicates?segmentType=${segmentType}&subject=${encodeURIComponent(subject)}`,
    { headers: authHeader() }
  );
  if (!res.ok) throw new Error("Failed to find duplicates");
  return res.json();
};
 
export const resolveDuplicates = async (keepId, groupIds) => {
  const res = await fetch(
    `${BASE_URL}/questions/duplicates/resolve?keepId=${keepId}`,
    {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(groupIds),
    }
  );
  if (!res.ok) throw new Error("Failed to resolve duplicates");
  return res.text();
};
 
/* ===================================================== */
/* ================= BATCHES =========================== */
/* ===================================================== */
 
/** How many batches for N days (days x 6). */
export const getBatchesNeeded = async (days) => {
  const res = await fetch(`${BASE_URL}/batches/needed?days=${days}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load batch count");
  return res.json();
};
 
/** Build batches. request = {segmentKey, startDate, days, questionsPerBatch?, autoFill} */
export const buildBatches = async (request) => {
  const res = await fetch(`${BASE_URL}/batches/build`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error("Failed to build batches");
  return res.json();
};
 
/** Manually assign question ids to a batch. */
export const assignBatchQuestions = async (batchId, questionIds) => {
  const res = await fetch(`${BASE_URL}/batches/${batchId}/questions`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(questionIds),
  });
  if (!res.ok) throw new Error("Failed to assign questions");
  return res.json();
};
 
export const getBatches = async (segmentKey) => {
  const res = await fetch(
    `${BASE_URL}/batches?segmentKey=${encodeURIComponent(segmentKey)}`,
    { headers: authHeader() }
  );
  if (!res.ok) throw new Error("Failed to load batches");
  return res.json();
};
 
export const rotateBatch = async (segmentKey) => {
  const res = await fetch(
    `${BASE_URL}/batches/rotate?segmentKey=${encodeURIComponent(segmentKey)}`,
    { method: "POST", headers: authHeader() }
  );
  if (!res.ok) throw new Error("Failed to rotate batch");
  return res.json();
};
 
export const getStock = async () => {
  const res = await fetch(`${BASE_URL}/batches/stock`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load stock status");
  return res.json();
};
 
/* ===================================================== */
/* ================= CONFIG ============================ */
/* ===================================================== */
 
export const getConfigs = async () => {
  const res = await fetch(`${BASE_URL}/quiz-config`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load configs");
  return res.json();
};
 
export const createConfig = async (config) => {
  const res = await fetch(`${BASE_URL}/quiz-config`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to create config");
  return res.json();
};
 
export const updateConfig = async (id, config) => {
  const res = await fetch(`${BASE_URL}/quiz-config/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
};
 
