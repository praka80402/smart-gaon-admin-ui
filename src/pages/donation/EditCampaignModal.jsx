// import { useState, useEffect } from "react";
// import api from "./services/axiosInstance";
// import "./donation.css";

// export default function EditCampaignModal({ project, onClose, onUpdated }) {

//   const [form, setForm] = useState({});
//   const [image, setImage] = useState(null);
//   const [gallery, setGallery] = useState([]);

//   useEffect(() => {
//     if (project) setForm(project);
//   }, [project]);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     try {
//       const fd = new FormData();
//       fd.append("title", form.title);
//       fd.append("description", form.description);
//       fd.append("type", form.type);
//       fd.append("state", form.state);
//       fd.append("pincode", form.pincode || "");
//       fd.append("district", form.district || "");
//       fd.append("village", form.village || "");
//       fd.append("targetAmount", form.targetAmount);

//       if (image) fd.append("image", image);
//       gallery.forEach(g => fd.append("galleryImages", g));

//       await api.put(`/admin/donation/campaign/${form.id}`, fd, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`
//         }
//       });

//       alert("Campaign Updated Successfully");
//       onUpdated();
//       onClose();

//     } catch (err) {
//       console.error(err);
//       alert("Update failed");
//     }
//   };

//   if (!project) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal">

//         <h3>Edit Campaign</h3>

//         <form onSubmit={handleUpdate} className="donation-form">

//           <input name="title" value={form.title || ""} onChange={handleChange} required />

//           <textarea name="description" value={form.description || ""} onChange={handleChange} required />

//           <select name="state" value={form.state || ""} onChange={handleChange}>
//             <option value="ALL">ALL INDIA</option>
//             <option value="BIHAR">BIHAR</option>
//             <option value="JHARKHAND">JHARKHAND</option>
//             <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
//             <option value="MAHARASHTRA">MAHARASHTRA</option>
//             <option value="GUJARAT">GUJARAT</option>
//           </select>

//           <input name="district" value={form.district || ""} onChange={handleChange} placeholder="District"/>
//           <input name="village" value={form.village || ""} onChange={handleChange} placeholder="Village"/>
//           <input name="pincode" value={form.pincode || ""} onChange={handleChange} placeholder="Pincode"/>

//           <input type="number" name="targetAmount" value={form.targetAmount || ""} onChange={handleChange} required />

//           <label>Change Cover Image</label>
//           <input type="file" onChange={e=>setImage(e.target.files[0])}/>

//           <label>Add Gallery Images</label>
//           <input type="file" multiple onChange={e=>setGallery([...e.target.files])}/>

//           <div className="modal-actions">
//             <button type="submit" className="edit-btn">Update</button>
//             <button type="button" className="delete-btn" onClick={onClose}>Cancel</button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// }

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (url) => {
    setExistingGallery(prev => prev.filter(img => img !== url));
    setRemovedImages(prev => [...prev, url]);
  };

  /* ================= ADD NEW IMAGES ================= */
  const handleNewGallery = (e) => {
    const files = Array.from(e.target.files);

    const total = existingGallery.length + newGallery.length + files.length;

    if (total > 15) {
      alert("Maximum 15 gallery images allowed");
      return;
    }

    setNewGallery(prev => [...prev, ...files]);
  };

  /* ================= UPDATE ================= */
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
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
    <div className="modal-overlay">
      <div className="modal">

        <h3>Edit Campaign</h3>

        <form onSubmit={handleUpdate} className="donation-form">

          <input name="title" value={form.title || ""} onChange={handleChange} required />

          <textarea name="description" value={form.description || ""} onChange={handleChange} required />

          <select name="state" value={form.state || ""} onChange={handleChange}>
            <option value="ALL">ALL INDIA</option>
            <option value="BIHAR">BIHAR</option>
            <option value="JHARKHAND">JHARKHAND</option>
            <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
            <option value="MAHARASHTRA">MAHARASHTRA</option>
            <option value="GUJARAT">GUJARAT</option>
          </select>

          <input name="district" value={form.district || ""} onChange={handleChange} placeholder="District"/>
          <input name="village" value={form.village || ""} onChange={handleChange} placeholder="Village"/>
          <input name="pincode" value={form.pincode || ""} onChange={handleChange} placeholder="Pincode"/>

          <input type="number" name="targetAmount" value={form.targetAmount || ""} onChange={handleChange} required />

          {/* COVER IMAGE */}
          <label>Change Cover Image</label>
          <input type="file" onChange={e=>setImage(e.target.files[0])}/>

          {/* EXISTING GALLERY */}
          <label>Existing Gallery (Click to remove)</label>
          <div className="gallery-preview">
            {existingGallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="gallery-img"
                onClick={() => removeImage(img)}
                title="Click to remove"
              />
            ))}
          </div>

          {/* NEW IMAGES */}
          <label>Add New Images</label>
          <input type="file" multiple onChange={handleNewGallery}/>

          <p>{existingGallery.length + newGallery.length} / 15 images</p>

          <div className="modal-actions">
            <button type="submit" className="edit-btn">Update</button>
            <button type="button" className="delete-btn" onClick={onClose}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
