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

function isNewFile(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function appendMedia(formData, fieldName, value, filename) {
  if (!value) return;
  if (value instanceof Blob) {
    formData.append(fieldName, value, filename);
    return;
  }
  if (isNewFile(value)) {
    const blob = dataUrlToBlob(value);
    if (blob) formData.append(fieldName, blob, filename);
  }
}

function buildVillageFormData(payload = {}) {
  const formData = new FormData();

  // Village images: keep existing (non-data:) URLs, upload new (data:) ones.
  const existingVillageImages = (payload.images || []).filter((img) => !isNewFile(img));
  const newVillageImages = (payload.images || []).filter((img) => isNewFile(img));

  // Popular places: split each place's photos into "keep" vs "new".
  const placesWithSplit = (payload.popularPlaces || []).map((place) => {
    const allPhotos = place.photos || [];
    return {
      ...place,
      existingPhotos: allPhotos.filter((p) => !isNewFile(p)),
      newPhotos: allPhotos.filter((p) => isNewFile(p)),
    };
  });

  const village = {
    name: payload.name || "",
    district: payload.district || "",
    state: payload.state || "",
    description: payload.description || "",
    popularPlace: !!payload.popularPlace,
    smartGaon: !!payload.smartGaon,
    stayEnquiry: !!payload.stayEnquiry,
    images: existingVillageImages,
    popularPlaces: placesWithSplit.map((place) => ({
      name: place.name || "",
      description: place.description || "",
      videoUrl: place.videoUrl || "",
      photos: place.existingPhotos,
      newPhotoCount: place.newPhotos.length,
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

  newVillageImages.forEach((image, index) => {
    appendMedia(formData, "images", image, `village-image-${index + 1}.jpg`);
  });

  // Flat list of new popular-place photos, in the same place order as above —
  // backend consumes newPhotoCount files per place from this list, in order.
  placesWithSplit.forEach((place, placeIndex) => {
    place.newPhotos.forEach((photo, photoIndex) => {
      appendMedia(
        formData,
        "popularPlacePhotos",
        photo,
        `popular-place-${placeIndex + 1}-photo-${photoIndex + 1}.jpg`
      );
    });
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