import React, { useState } from "react";
import {
  addGalleryImages,
  removeGalleryImage,
} from "./services/donationService";
import "./gallery.css";

const GalleryModal = ({ project, onClose, onUpdated }) => {
  const [files, setFiles] = useState([]);

  const uploadImages = async () => {
    if (files.length === 0) return alert("Select images");

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    await addGalleryImages(project.id, fd);
    onUpdated();
    setFiles([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <h3>Gallery – {project.projectName}</h3>

        {/* EXISTING GALLERY */}
        <div className="upload-box">
          {project.galleryImages?.length === 0 && (
            <p>No gallery images</p>
          )}

          {project.galleryImages?.map((img, i) => (
            <div key={i} className="preview">
              <img src={img} alt="" />
              <button
                onClick={async () => {
                  await removeGalleryImage(project.id, img);
                  onUpdated();
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* UPLOAD NEW */}
        <label>Add Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files))}
        />

        <div className="modal-actions">
          <button className="btn-primary" onClick={uploadImages}>
            Upload
          </button>
          {/* <button className="gallery-close" onClick={onClose}>✕</button> */}
            <span className="modal-close" onClick={onClose}>
          X
        </span>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
