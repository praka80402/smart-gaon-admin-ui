

import { useEffect, useState } from "react";
import {
  createDevelopment,
  createMaster,
  getAllMasters
} from "../service/developmentservice";
import "./development.css";

export default function CreateDevelopment() {

  const [masters, setMasters] = useState([]);
  const [showTitleBox, setShowTitleBox] = useState(false);

  const [form, setForm] = useState({
    phaseNumber: "",
    customPhase: "",
    masterId: "",
    description: "",
    status: "UPCOMING",
    startDate: "",
    endDate: ""
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  const [newTitle, setNewTitle] = useState("");
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    const res = await getAllMasters();
    setMasters(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE HANDLER ================= */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 24) {
      alert("Maximum 24 images allowed");
      return;
    }

    setImages(files);
    setPreview(files.map(file => URL.createObjectURL(file)));
  };

  /* ================= CREATE DEVELOPMENT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    const phase =
      form.phaseNumber === "custom"
        ? form.customPhase
        : form.phaseNumber;

    formData.append("phaseNumber", phase);
    formData.append("masterId", form.masterId);
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);

    images.forEach(img => {
      formData.append("images", img);
    });

    await createDevelopment(formData);
    alert("Development Created Successfully ✅");

    // Reset form
    setForm({
      phaseNumber: "",
      customPhase: "",
      masterId: "",
      description: "",
      status: "UPCOMING",
      startDate: "",
      endDate: ""
    });
    setImages([]);
    setPreview([]);
  };

  /* ================= ADD MASTER ================= */
  const handleAddTitle = async () => {
    if (!newTitle || !newImage)
      return alert("Title & Image required");

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("image", newImage);

    await createMaster(formData);

    alert("Title Added ✅");

    setNewTitle("");
    setNewImage(null);
    setShowTitleBox(false);
    fetchMasters();
  };

  return (
    <div className="card">

      <h2>Create Development</h2>

      <button onClick={() => setShowTitleBox(!showTitleBox)}>
        + Add Title
      </button>

      {showTitleBox && (
        <div className="title-box">
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
          />
          <button onClick={handleAddTitle}>Save Title</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">

        {/* Phase */}
        <select
          name="phaseNumber"
          value={form.phaseNumber}
          onChange={handleChange}
          required
        >
          <option value="">Select Phase</option>
          <option value="1">Phase 1</option>
          <option value="2">Phase 2</option>
          <option value="3">Phase 3</option>
          <option value="custom">Custom Phase</option>
        </select>

        {form.phaseNumber === "custom" && (
          <input
            type="number"
            name="customPhase"
            placeholder="Custom Phase Number"
            value={form.customPhase}
            onChange={handleChange}
            required
          />
        )}

        {/* Master Title */}
        <select
          name="masterId"
          value={form.masterId}
          onChange={handleChange}
          required
        >
          <option value="">Select Title</option>
          {masters.map(m => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        {/* Status */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETE">Complete</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
        />

        {/* End Date */}
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
        />

        {/* Multiple Images */}
        <input
          type="file"
          multiple
          onChange={handleImageChange}
        />

        <div className="preview">
          {preview.map((src, index) => (
            <img key={index} src={src} alt="preview" />
          ))}
        </div>

        <button type="submit">
          Create Development
        </button>

      </form>

    </div>
  );
}