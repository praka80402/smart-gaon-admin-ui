const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";
 //const BASE_URL = "http://localhost:9090/api/admin";
 
const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("adminToken"),
});
 
/* ===================================================== */
/* ================= QUESTIONS ========================= */
/* ===================================================== */
 
/** Bulk Excel upload. Returns {inserted, duplicatesSkipped, invalidRowsSkipped, message} */
export const uploadQuestionsExcel = async (file, segmentType, classLevel, competitionType, language = "EN") => {
  const form = new FormData();
  form.append("file", file);
  let url = `${BASE_URL}/questions/upload?segmentType=${segmentType}&language=${language}`;
  if (classLevel) url += `&classLevel=${classLevel}`;
  if (competitionType) url += `&competitionType=${competitionType}`;
  const res = await fetch(url, {
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
export const getQuestions = async (segmentType, language = "EN") => {
  const res = await fetch(`${BASE_URL}/questions?segmentType=${segmentType}&language=${language}`, {
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
/* ================= UPLOAD HISTORY ==================== */
/* ===================================================== */

export const getUploadHistory = async () => {
  const res = await fetch(`${BASE_URL}/questions/upload-history`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load upload history");
  return res.json();
};

export const downloadUploadFile = async (id, fileName) => {
  const res = await fetch(`${BASE_URL}/questions/upload-history/${id}/download`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to download file");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const deleteUploadHistory = async (id) => {
  const res = await fetch(`${BASE_URL}/questions/upload-history/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete upload history entry");
  return res.text();
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

export const downloadSampleTemplate = async () => {
  const res = await fetch(`${BASE_URL}/questions/sample-template`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to download template");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quiz_template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
};
 
