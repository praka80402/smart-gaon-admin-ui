// src/pages/gaonconnect/EditModal.jsx
import React, { useState, useEffect } from "react";
import "./gaonconnect.css";

const EditModal = ({ visible, onClose, initial, type, onSave }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setBody(initial.summary || initial.description || "");
      setImageUrl(initial.thumbnailUrl || initial.pictureUrl || "");
    }
  }, [initial]);

  if (!visible) return null;

  const handleSave = async () => {
    let finalUrl = imageUrl;

    // If NEW file selected → convert to temporary URL (frontend-only preview)
    // Upload in backend is not supported for editing, so store old URL unchanged.
    
    const payload =
      type === "News"
        ? {
            ...initial,
            title,
            summary: body,
            content: body,
            thumbnailUrl: finalUrl,
          }
        : {
            ...initial,
            title,
            description: body,
            pictureUrl: finalUrl,
          };

    onSave(payload);
  };

  return (
    <div className="gc-modal-backdrop">
      <div className="gc-modal">
        <h3>Edit {type}</h3>

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />

        <label>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {imageUrl && (
          <img src={imageUrl} alt="preview" className="gc-thumb-small" />
        )}

        <div className="gc-modal-actions">
          <button onClick={handleSave} className="gc-submit">
            Save
          </button>
          <button onClick={onClose} className="gc-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
