import { useState, useEffect } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

export default function EditCampaignModal({ project, onClose, onUpdated }) {

  const [form, setForm] = useState({});
  const [image, setImage] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newGallery, setNewGallery] = useState([]);

  useEffect(() => {
    if (project) {
      setForm(project);
      setExistingGallery(project.galleryImages || []);
      setRemovedImages([]);
      setNewGallery([]);
    }
  }, [project]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const removeImage = (url) => {
    setExistingGallery(prev => prev.filter(img => img !== url));
    setRemovedImages(prev => [...prev, url]);
  };

  const handleNewGallery = (e) => {
    const files = Array.from(e.target.files);
    const total = existingGallery.length + newGallery.length + files.length;
    if (total > 15) { alert("Maximum 15 gallery images allowed"); return; }
    setNewGallery(prev => [...prev, ...files]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("type", form.type);
      fd.append("state", form.state);
      fd.append("pincode", form.pincode || "");
      fd.append("district", form.district || "");
      fd.append("village", form.village || "");
      fd.append("targetAmount", form.targetAmount);
      if (image) fd.append("image", image);
      newGallery.forEach(file => fd.append("newGalleryImages", file));
      removedImages.forEach(url => fd.append("removedImages", url));

      await api.put(`/admin/donation/campaign/${form.id}`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      alert("Campaign Updated Successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (!project) return null;

  return (
    <div className="em-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="em-modal">

        {/* Header */}
        <div className="em-header">
          <h2 className="em-title">Edit Campaign</h2>
          <button className="em-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleUpdate} className="em-form">

          <div className="em-field">
            <label className="em-label">Campaign Title</label>
            <input className="em-input" name="title" value={form.title || ""} onChange={handleChange} required />
          </div>

          <div className="em-field">
            <label className="em-label">Description</label>
            <textarea className="em-input em-textarea" name="description" value={form.description || ""} onChange={handleChange} required />
          </div>

          <div className="em-row">
            <div className="em-field">
              <label className="em-label">State</label>
              <select className="em-input" name="state" value={form.state || ""} onChange={handleChange}>
                <option value="ALL">ALL INDIA</option>
                <option value="BIHAR">BIHAR</option>
                <option value="JHARKHAND">JHARKHAND</option>
                <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
                <option value="MAHARASHTRA">MAHARASHTRA</option>
                <option value="GUJARAT">GUJARAT</option>
              </select>
            </div>

            <div className="em-field">
              <label className="em-label">Target Amount (₹)</label>
              <input className="em-input" type="number" name="targetAmount" value={form.targetAmount || ""} onChange={handleChange} required />
            </div>
          </div>

          <div className="em-row">
            <div className="em-field">
              <label className="em-label">District</label>
              <input className="em-input" name="district" value={form.district || ""} onChange={handleChange} placeholder="District" />
            </div>
            <div className="em-field">
              <label className="em-label">Village</label>
              <input className="em-input" name="village" value={form.village || ""} onChange={handleChange} placeholder="Village" />
            </div>
            <div className="em-field">
              <label className="em-label">Pincode</label>
              <input className="em-input" name="pincode" value={form.pincode || ""} onChange={handleChange} placeholder="Pincode" />
            </div>
          </div>

          {/* Cover Image */}
          <div className="em-field">
            <label className="em-label">Change Cover Image</label>
            <div className="em-file-box">
              <label className="em-file-btn">
                Choose file
                <input type="file" style={{ display: "none" }} onChange={e => setImage(e.target.files[0])} />
              </label>
              <span className="em-file-name">{image ? image.name : "No file chosen"}</span>
            </div>
          </div>

          {/* Existing Gallery */}
          {existingGallery.length > 0 && (
            <div className="em-field">
              <label className="em-label">Existing Gallery <span className="em-hint">(click to remove)</span></label>
              <div className="em-gallery-grid">
                {existingGallery.map((img, i) => (
                  <div key={i} className="em-gallery-item" onClick={() => removeImage(img)}>
                    <img src={img} alt="" />
                    <div className="em-gallery-remove">✕</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <div className="em-field">
            <label className="em-label">
              Add New Images
              <span className="em-count">{existingGallery.length + newGallery.length}/15</span>
            </label>
            <div className="em-file-box">
              <label className="em-file-btn">
                Choose files
                <input type="file" multiple style={{ display: "none" }} onChange={handleNewGallery} />
              </label>
              <span className="em-file-name">{newGallery.length > 0 ? `${newGallery.length} file(s) selected` : "No files chosen"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="em-actions">
            <button type="button" className="em-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="em-btn-update">Update Campaign</button>
          </div>

        </form>
      </div>
    </div>
  );
}
