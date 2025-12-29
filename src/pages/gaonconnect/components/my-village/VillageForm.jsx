import { useState } from "react";
import "./VillageForm.css";

export default function VillageForm({ data, onClose }) {
  const isEdit = !!data?.city; // means data contains existing full details

  const [form, setForm] = useState({
    name: data?.name || "",
    city: data?.city || "",
    state: data?.state || "",
    description: data?.description || "",
    images: data?.images || []   // array of URLs
  });

  const [imgIndex, setImgIndex] = useState(0);

  const handleChange = (e)=> {
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = () => {
    console.log("Saving village ->", form);
    alert("Saved (dummy)");
    onClose();
  };

  const next = () => {
    if (form.images.length > 0) {
      setImgIndex((imgIndex + 1) % form.images.length);
    }
  };

  const prev = () => {
    if (form.images.length > 0) {
      setImgIndex((imgIndex - 1 + form.images.length) % form.images.length);
    }
  };

  return (
    <div className="village-form-wrapper">
      {/* ---------------- LEFT FORM PANEL ---------------- */}
      <div className="form-panel">
        <h2>{isEdit ? "Edit Village Details" : "Add New Village"}</h2>

        <label>Village Name</label>
        <input name="name" value={form.name} onChange={handleChange}/>

        <label>City / District</label>
        <input name="city" value={form.city} onChange={handleChange}/>

        <label>State</label>
        <input name="state" value={form.state} onChange={handleChange}/>

        <label>Short Description</label>
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />

        <div className="form-btn-row">
          <button className="save-btn" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Save"}
          </button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>

      {/* ---------------- RIGHT PREVIEW PANEL ---------------- */}
      {isEdit && (
        <div className="preview-panel">
          <h3>WELCOME TO</h3>
          <h1 className="preview-title">{form.name}</h1>
          <p>{form.city}, {form.state}</p>

          {/* ---- IMAGE SLIDER ---- */}
          <div className="preview-slider">
            {form.images.length > 0 ? (
              <>
                <button className="slider-btn" onClick={prev}>&lt;</button>
                <img src={form.images[imgIndex]} alt="village" />
                <button className="slider-btn" onClick={next}>&gt;</button>
              </>
            ) : (
              <div className="no-img-box">
                No images selected yet
              </div>
            )}
          </div>

          {/* ---- INFO TABLE ---- */}
          <table className="preview-table">
            <tbody>
              <tr><td>Village Name</td><td>{form.name}</td></tr>
              <tr><td>District</td><td>{form.city}</td></tr>
              <tr><td>State</td><td>{form.state}</td></tr>
            </tbody>
          </table>

          <h3>About this village</h3>
          <p>{form.description || "No description added yet."}</p>
        </div>
      )}
    </div>
  );
}
