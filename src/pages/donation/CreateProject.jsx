import React, { useState } from "react";
import { createDonationProject } from "./services/donationService";
import "./donation.css";

const STATES = [
  "BIHAR",
  "JHARKHAND",
  "UTTAR_PRADESH",
  "MAHARASHTRA",
  "GUJARAT",
];

const CreateProject = () => {
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    requiredAmount: "",
  });

  const [allStates, setAllStates] = useState(false);
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // ✅ NEW: multiple images & videos
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleVideos = (e) => {
    setVideos(Array.from(e.target.files));
  };

  const submit = async () => {
    // basic validation
    if (!form.projectName || !form.requiredAmount) {
      alert("Project name and required amount are mandatory");
      return;
    }

    if (!allStates && (!state || !pincode)) {
      alert("Please select state and pincode");
      return;
    }

    await createDonationProject({
      projectName: form.projectName,
      description: form.description,
      requiredAmount: Number(form.requiredAmount),
      allStates,
      state: allStates ? null : state,
      pincode: allStates ? null : pincode,

      // ✅ TEMP: sending file names as URLs
      // Later replace with Cloudinary/S3 uploaded URLs
      imageUrls: images.map((f) => f.name),
      videoUrls: videos.map((f) => f.name),
    });

    alert("Donation Project Created Successfully");

    // reset form
    setForm({ projectName: "", description: "", requiredAmount: "" });
    setAllStates(false);
    setState("");
    setPincode("");
    setImages([]);
    setVideos([]);
  };

  return (
    <div className="donation-form-card">
      <h3 className="donation-subtitle">Create Donation Project</h3>

      <div className="donation-form">
         <label>Project Name</label>
        <input
          placeholder="Project Name"
          value={form.projectName}
          onChange={(e) =>
            setForm({ ...form, projectName: e.target.value })
          }
        />
         <label>Description</label>
        <textarea
          placeholder="Description (max 1500)"
          maxLength={1500}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
       <label>Raise Amount</label>
        <input
          type="number"
          placeholder="Required Amount"
          value={form.requiredAmount}
          onChange={(e) =>
            setForm({ ...form, requiredAmount: e.target.value })
          }
        />

        {/* ✅ MULTIPLE IMAGES */}
        <label>Project Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="file-input"
          onChange={handleImages}
        />

        {/* Preview image names */}
        {images.length > 0 && (
          <small>{images.length} image(s) selected</small>
        )}

        {/* ✅ MULTIPLE VIDEOS */}
        <label>Project Videos</label>
        <input
          type="file"
          multiple
          accept="video/*"
          className="file-input"
          onChange={handleVideos}
        />

        {videos.length > 0 && (
          <small>{videos.length} video(s) selected</small>
        )}

        {/* ✅ CHECKBOX */}
        <div className="checkbox-row">
          <input
            id="allStates"
            type="checkbox"
            checked={allStates}
            onChange={() => setAllStates(!allStates)}
          />
          <label htmlFor="allStates">All States</label>
        </div>

        {!allStates && (
          <>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          <label>Pincode</label>
            <input
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </>
        )}

        <button className="btn-primary" onClick={submit}>
          Post Project
        </button>
      </div>
    </div>
  );
};

export default CreateProject;
