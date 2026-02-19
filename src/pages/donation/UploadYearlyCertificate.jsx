import { useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

export default function UploadYearlyCertificate() {

  const [phone, setPhone] = useState("");
  const [fy, setFy] = useState("");
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= SEARCH USER ================= */
  const searchUser = async () => {

    if (!phone) return alert("Enter phone number");

    try {
      setLoading(true);

      // ✅ CORRECT API
      const res = await api.get(`/admin/users/by-phone/${phone}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });

      setUser(res.data);

    } catch (err) {
      console.error(err);
      alert("User not found");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPLOAD PDF ================= */
  const upload = async () => {

    if (!user) return alert("Search user first");
    if (!fy) return alert("Select financial year");
    if (!file) return alert("Choose PDF file");

    try {

      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        `/admin/report/yearly/upload/${user.id}/${fy}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Certificate uploaded successfully");
      setFile(null);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="donation-card">

      <h3>Upload Financial Year Certificate</h3>

      {/* SEARCH */}
      <div className="filter-bar">
        <input
          placeholder="Enter Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button className="view-btn" onClick={searchUser}>
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {/* USER INFO */}
      {user && (
        <div className="user-info-box">

          <p><b>Name:</b> {user.name}</p>
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>State:</b> {user.state || "-"}</p>
          <p><b>District:</b> {user.district || "-"}</p>

          <hr/>

          {/* FY SELECT */}
          <select value={fy} onChange={e => setFy(e.target.value)}>
            <option value="">Select Financial Year</option>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>

          {/* FILE */}
          <input
            type="file"
            accept="application/pdf"
            onChange={e => setFile(e.target.files[0])}
          />

          <button className="edit-btn" onClick={upload}>
            Upload Certificate
          </button>

        </div>
      )}

    </div>
  );
}
