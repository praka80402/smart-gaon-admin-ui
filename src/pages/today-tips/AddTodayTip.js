import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";

import "./addtips.css";


export default function AddTodayTip({ onSuccess, initialData = null, docId = null }) {
  const [title, setTitle] = useState("");
  const [occupation, setOccupation] = useState(""); // UPDATED: category → occupation
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 300 * 1024; // 300 KB

  const parseDateToISO = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [d, m, y] = ddmmyyyy.split("-");
    return `${y}-${m}-${d}`;
  };

  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      const cat = initialData.category;
      setOccupation(cat === "ALL" ? "ALL" : cat || "");
      setDescription(initialData.description || "");
      // If we are editing, date from API will already be in YYYY-MM-DD format
      setDate(initialData.targetDate || "");
      setImageBase64(initialData.imageUrl || "");
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!title || !occupation || !date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    let finalImage = imageBase64;
    if (imageFile) finalImage = await toBase64(imageFile);

    const payload = {
      id: docId, // Send existing id if updating
      title,
      category: occupation,
      description,
      imageUrl: finalImage,
      targetDate: date
    };

    try {
      await api.post("/api/tips/add", payload);
    } catch (err) {
      console.error("Error saving tip:", err);
      alert("Failed to save tip");
    }

    setLoading(false);
    onSuccess();
  };
return (
  <div className="tip-form-container">

    {/* <h2 className="tip-form-title">
      {docId ? "Edit Today Tip" : "Add Today Tip"}
    </h2> */}

    <div className="tip-form-group">
      <label>Date</label>
      <input
        type="date"
        className="tip-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>

    <div className="tip-form-group">
      <label>Title</label>
      <input
        type="text"
        className="tip-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter tip title"
      />
    </div>

    <div className="tip-form-group">
      <label>Occupation</label>
      <select
        className="tip-input"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
      >
        <option value="">Select Occupation</option>
        <option value="ALL">All</option>
        <option value="Citizen">Citizen</option>
        <option value="Farmer">Farmer</option>
        <option value="Vendor">Vendor</option>
        <option value="Teacher">Teacher</option>
        <option value="Electrician">Electrician</option>
      </select>
    </div>

    <div className="tip-form-group">
      <label>Description</label>
      <textarea
        className="tip-input tip-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Write description..."
      />
    </div>

    {imageBase64 && !imageFile && (
      <div className="tip-preview-block">
        <label>Current Image</label>
        <img src={imageBase64} alt="preview" className="tip-preview-img" />
      </div>
    )}

    <div className="tip-form-group">
      <label>Upload Image</label>

      <label className="tip-upload-box">
        <input
          type="file"
          accept="image/*"
          className="tip-hidden-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > MAX_FILE_SIZE) {
              alert("Image too large! Max allowed size is 300 KB.");
              e.target.value = "";
              return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = () => setImageBase64(reader.result);
            reader.readAsDataURL(file);
          }}
        />
        Click to upload image (Max 300KB)
      </label>

      {imageBase64 && imageFile && (
        <img src={imageBase64} className="tip-preview-img" alt="preview" />
      )}
    </div>

    <button
      className="tip-save-btn"
      disabled={loading}
      onClick={handleSave}
    >
      {loading ? "Saving..." : docId ? "Update Tip" : "Save Tip"}
    </button>


    </div>
  );
}

