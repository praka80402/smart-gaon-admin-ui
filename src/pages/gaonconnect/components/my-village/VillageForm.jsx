import { useEffect, useState } from "react";
import "./VillageForm.css";

const CREATE_URL = "https://smartgaonadmin.duckdns.org/admin/villages/upload";
const UPDATE_URL = "https://smartgaonadmin.duckdns.org/admin/villages"; // + /{id}/upload

export default function VillageForm({ data, onClose }) {
  const isEdit = !!data?.id;

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    description: ""
  });

  const [existingImages, setExistingImages] = useState([]); // old image URLs
  const [newImages, setNewImages] = useState([]);           // new uploaded files
  const [newPreviewUrls, setNewPreviewUrls] = useState([]); // preview of new images

  /* ---------- Reset when Add/Edit opens ---------- */
  useEffect(() => {
    setForm({
      name: data?.name || "",
      city: data?.city || "",
      state: data?.state || "",
      description: data?.description || ""
    });

    setExistingImages(data?.images || []);
    setNewImages([]);
    setNewPreviewUrls([]);

  }, [data]);

  /* ---------- text change ---------- */
  const handleChange = (e)=> {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- select new images for upload ---------- */
  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(previews);
  };

  /* ---------- remove existing image (not deleting from server, just UI remove) ---------- */
  const removeExistingImage = (url) => {
    setExistingImages(existingImages.filter(img => img !== url));
  };

  /* ---------- remove newly added image BEFORE saving ---------- */
  const removeNewPreview = (idx) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
    setNewPreviewUrls(newPreviewUrls.filter((_, i) => i !== idx));
  };

  /* ---------- submit create or update ---------- */
  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("city", form.city);
    fd.append("state", form.state);
    fd.append("description", form.description);

    // append new images only (backend merges with old ones)
    newImages.forEach(file => fd.append("images", file));

    const url = isEdit ? `${UPDATE_URL}/${data.id}/upload` : CREATE_URL;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text();
        alert(msg);
        return;
      }

      const result = await res.json();
      console.log("Village saved:", result);
      alert("Village saved successfully!");
      onClose();

    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed: " + err.message);
    }
  };


  return (
    <div className="village-form-wrapper">

      {/* ---------------- LEFT FORM PANEL ---------------- */}
      <div className="form-panel">
        <h2>{isEdit ? "Edit Village Details" : "Add New Village"}</h2>

        <label>Village Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>City / District</label>
        <input name="city" value={form.city} onChange={handleChange} />

        <label>State</label>
        <input name="state" value={form.state} onChange={handleChange} />

        <label>Short Description</label>
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />

        <label>Add More Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* ---------- preview new images ---------- */}
        {newPreviewUrls.length > 0 && (
          <div className="image-preview-grid">
            {newPreviewUrls.map((url, i) => (
              <div key={i} className="preview-box">
                <img src={url} alt="preview" className="preview-img" />
                <button className="remove-img-btn" onClick={() => removeNewPreview(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="form-btn-row">
          <button className="save-btn" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Save"}
          </button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>


      {/* ---------------- RIGHT PREVIEW PANEL (EDIT MODE) ---------------- */}
      {isEdit && (
        <div className="preview-panel">
          <h3>Existing Images</h3>

          <div className="image-preview-grid">
            {existingImages.length > 0 ? existingImages.map((img, i) => (
              <div key={i} className="preview-box">
                <img src={img} alt="existing" className="preview-img" />
                <button className="remove-img-btn" onClick={() => removeExistingImage(img)}>✕</button>
              </div>
            )) : <div>No images yet</div>}
          </div>

          <h3>About this village</h3>
          <p>{form.description || "No description added yet."}</p>
        </div>
      )}

    </div>
  );
}
