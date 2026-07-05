import { api } from "./config";

export const getAllVillages = () => api.get("/api/admin/villages");

export const getVillageById = (id) => api.get(`/api/admin/villages/${id}`);

function dataUrlToBlob(value) {
  if (!value || typeof value !== "string") return null;
  if (!value.startsWith("data:")) return null;

  const [meta, base64] = value.split(",");
  const mimeMatch = meta.match(/data:(.*?)(?:;base64)?$/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";

  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

function appendMedia(formData, fieldName, value, filename) {
  if (!value) return;

  if (value instanceof Blob) {
    formData.append(fieldName, value, filename);
    return;
  }

  if (typeof value === "string" && value.startsWith("data:")) {
    const blob = dataUrlToBlob(value);
    if (blob) formData.append(fieldName, blob, filename);
  }
}

function buildVillageFormData(payload = {}) {
  const formData = new FormData();

  const village = {
    name: payload.name || "",
    district: payload.district || "",
    state: payload.state || "",
    description: payload.description || "",
    popularPlace: !!payload.popularPlace,
    smartGaon: !!payload.smartGaon,
    stayEnquiry: !!payload.stayEnquiry,
    popularPlaces: (payload.popularPlaces || []).map((place) => ({
      name: place.name || "",
      description: place.description || "",
      videoUrl: place.videoUrl || "",
    })),
    assignments: (payload.assignments || []).map((assignment) => ({
      developmentId: assignment.developmentId,
      progressPercent: Number(assignment.progressPercent || 0),
      videoUrl: assignment.videoUrl || "",
      images: assignment.images || [],
    })),
  };

  formData.append(
    "village",
    new Blob([JSON.stringify(village)], { type: "application/json" })
  );

  (payload.images || []).forEach((image, index) => {
    appendMedia(formData, "images", image, `village-image-${index + 1}.jpg`);
  });

  (payload.popularPlaces || []).forEach((place, index) => {
    appendMedia(
      formData,
      "popularPlacePhotos",
      place.photo,
      `popular-place-${index + 1}.jpg`
    );
  });

  (payload.assignments || []).forEach((assignment, index) => {
    appendMedia(
      formData,
      "assignmentDocuments",
      assignment.document,
      `assignment-document-${index + 1}.pdf`
    );
  });

  return formData;
}

export const createVillage = (payload) =>
  api.post("/api/admin/villages", payload instanceof FormData ? payload : buildVillageFormData(payload));

export const updateVillage = (id, payload) =>
  api.put(
    `/api/admin/villages/${id}`,
    payload instanceof FormData ? payload : buildVillageFormData(payload)
  );

export const deleteVillage = (id) => api.delete(`/api/admin/villages/${id}`);
