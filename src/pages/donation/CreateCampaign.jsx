import React, { useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

const CreateCampaign = () => {

  const [scope, setScope] = useState("ALL");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "PROJECT",
    state: "",
    pincode: "",
    district: "",
    village: "",
    targetAmount: ""
  });

  const [villages, setVillages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePincode = async (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, pincode: value }));

    if (value.length === 6 && scope === "STATE") {
      try {
        const res = await api.get(`/location/pincode/${value}`);

        if (!res.data || res.data.error || !res.data.state) {
          setVillages([]);
          return;
        }

        const apiState = res.data.state.toUpperCase().replace(/ /g, "_");

        setForm(prev => ({
          ...prev,
          state: apiState,
          district: res.data.district || "",
          village: ""
        }));

        setVillages(res.data.villages || []);

      } catch {
        setVillages([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);
      formData.append("targetAmount", form.targetAmount);

      if (scope === "ALL") {
        formData.append("state", "ALL");
        formData.append("pincode", "");
        formData.append("district", "");
        formData.append("village", "");
      } else {
        formData.append("state", form.state);
        formData.append("pincode", form.pincode);
        formData.append("district", form.district);
        formData.append("village", form.village);
      }

      if (image) formData.append("image", image);

      await api.post("/admin/donation/campaign", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      alert("Campaign Created Successfully ✅");

      setForm({
        title: "",
        description: "",
        type: "PROJECT",
        state: "",
        pincode: "",
        district: "",
        village: "",
        targetAmount: ""
      });

      setVillages([]);
      setImage(null);
      setScope("ALL");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-wrapper">
      <div className="cc-card">
        <h2 className="cc-title">Create Donation Campaign</h2>

        <form onSubmit={handleSubmit} className="cc-form">

          {/* Title */}
          <input
            className="cc-input"
            type="text"
            name="title"
            placeholder="Campaign Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* Description */}
          <textarea
            className="cc-input cc-textarea"
            name="description"
            placeholder="Campaign Description"
            value={form.description}
            onChange={handleChange}
            required
          />

          {/* Campaign Type */}
          <div className="cc-field">
            <label className="cc-label">Campaign Type</label>
            <select className="cc-input" name="type" value={form.type} onChange={handleChange}>
              <option value="PROJECT">Project</option>
              <option value="PROGRAM">Program</option>
            </select>
          </div>

          {/* Coverage */}
          <div className="cc-field">
            <label className="cc-label">Coverage</label>
            <div className="cc-scope-box">
              <label className="cc-radio-label">
                <input
                  type="radio"
                  checked={scope === "ALL"}
                  onChange={() => setScope("ALL")}
                />
                All India
              </label>
              <label className="cc-radio-label">
                <input
                  type="radio"
                  checked={scope === "STATE"}
                  onChange={() => setScope("STATE")}
                />
                Specific State
              </label>
            </div>
          </div>

          {/* State Fields */}
          {scope === "STATE" && (
            <>
              <div className="cc-field">
                <label className="cc-label">Pincode</label>
                <input
                  className="cc-input"
                  type="number"
                  name="pincode"
                  placeholder="Enter 6 digit pincode"
                  value={form.pincode}
                  onChange={handlePincode}
                  required
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">State</label>
                <select className="cc-input" name="state" value={form.state} onChange={handleChange} required>
                  <option value="">-- Select State --</option>
                  <option value="BIHAR">BIHAR</option>
                  <option value="JHARKHAND">JHARKHAND</option>
                  <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
                  <option value="MAHARASHTRA">MAHARASHTRA</option>
                  <option value="GUJARAT">GUJARAT</option>
                </select>
              </div>

              <div className="cc-field">
                <label className="cc-label">District</label>
                <input
                  className="cc-input"
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                  required
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">Village</label>
                {villages.length > 0 ? (
                  <select className="cc-input" name="village" value={form.village} onChange={handleChange} required>
                    <option value="">-- Select Village --</option>
                    {villages.map((v, i) => (
                      <option key={i} value={v}>{v}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="cc-input"
                    type="text"
                    name="village"
                    value={form.village}
                    onChange={handleChange}
                    placeholder="Enter village manually"
                    required
                  />
                )}
              </div>
            </>
          )}

          {/* Target Amount */}
          <div className="cc-field">
            <label className="cc-label">Target Amount</label>
            <input
              className="cc-input"
              type="number"
              name="targetAmount"
              placeholder="Enter Target Amount"
              value={form.targetAmount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="cc-field">
            <label className="cc-label">Upload Campaign Image</label>
            <div className="cc-file-box">
              <label className="cc-file-btn">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
              </label>
              <span className="cc-file-name">
                {image ? image.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="cc-submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
