import React, { useEffect, useState } from "react";
import { BASE_URL, authHeader } from "../myvillage/services/config";
import "./GaonDoctorAdmin.css";



const EMPTY_FORM = {
  id: null,
  name: "",
  specialty: "",
  qualification: "",
  clinicOrHospital: "",
  village: "",
  phone: "",
  availableTime: "",
  active: true,
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    ...authHeader(),
  };
}

export default function GaonDoctorAdmin({ onClose }) {
  const [activeTab, setActiveTab] = useState("list"); // "list" | "add"
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setStatus("loading");
    try {
      const [docRes, specRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/gaondoctor/doctors`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/api/admin/gaondoctor/specialties`, { headers: authHeaders() }),
      ]);
      if (!docRes.ok || !specRes.ok) throw new Error("Failed to load");
      setDoctors(await docRes.json());
      setSpecialties(await specRes.json());
      setStatus("ready");
    } catch (err) {
      setStatus("error");
    }
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setActiveTab("add");
  }

  function startEdit(doc) {
    setForm(doc);
    setActiveTab("add");
  }

  function cancelEdit() {
    setForm(EMPTY_FORM);
    setActiveTab("list");
  }

  async function saveDoctor(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const isUpdate = !!form.id;
      const url = isUpdate
        ? `${BASE_URL}/api/admin/gaondoctor/doctors/${form.id}`
        : `${BASE_URL}/api/admin/gaondoctor/doctors`;
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      await loadAll();
      cancelEdit();
    } catch (err) {
      alert("Could not save doctor. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDoctor(id) {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/gaondoctor/doctors/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Could not delete doctor.");
    }
  }

  return (
    <div className="gda-page">
      {onClose && (
        <button className="gda-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}

      <div className="gda-header">
        <h1>Gaon Doctor — Manage Doctors</h1>
      </div>

      {/* ── Tabs ── */}
      <div className="gda-tabs">
        <button
          className={`gda-tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          List of Doctors
        </button>
        <button
          className={`gda-tab-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={startCreate}
        >
          + Add Doctor
        </button>
      </div>

      {/* ── ADD / EDIT TAB ── */}
      {activeTab === "add" && (
        <form className="gda-form" onSubmit={saveDoctor}>
          <h3>{form.id ? "Edit Doctor" : "Add Doctor"}</h3>

          <div className="gda-form-grid">
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Specialty
              <select
                required
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Qualification
              <input
                value={form.qualification || ""}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
            </label>

            <label>
              Clinic / Hospital
              <input
                value={form.clinicOrHospital || ""}
                onChange={(e) => setForm({ ...form, clinicOrHospital: e.target.value })}
              />
            </label>

            <label>
              Village
              <input
                value={form.village || ""}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              />
            </label>

            <label>
              Phone
              <input
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>

            <label>
              Available Time
              <input
                placeholder="e.g. Mon-Sat, 10am-2pm"
                value={form.availableTime || ""}
                onChange={(e) => setForm({ ...form, availableTime: e.target.value })}
              />
            </label>

            <label className="gda-checkbox-label">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (visible on the public page)
            </label>
          </div>

          <div className="gda-form-actions">
            <button type="submit" className="gda-primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Doctor"}
            </button>
            <button type="button" className="gda-secondary-btn" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div className="gda-section">
          {status === "loading" && <p>Loading doctors...</p>}
          {status === "error" && <p className="gda-error">Could not load doctors.</p>}

          {status === "ready" && (
            <table className="gda-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Clinic / Hospital</th>
                  <th>Village</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.specialty}</td>
                    <td>{doc.clinicOrHospital}</td>
                    <td>{doc.village}</td>
                    <td>{doc.phone}</td>
                    <td>
                      <span className={`gda-status ${doc.active ? "active" : "inactive"}`}>
                        {doc.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="gda-row-actions">
                      <button onClick={() => startEdit(doc)}>Edit</button>
                      <button className="gda-delete-btn" onClick={() => deleteDoctor(doc.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="gda-empty">
                      No doctors added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
