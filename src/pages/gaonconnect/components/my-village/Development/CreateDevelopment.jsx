import { useEffect, useState } from "react";
import {
  createDevelopment,
  createMaster,
  getAllMasters,
  getAllDevelopment,
  updateDevelopment,
  deleteDevelopment,
} from "../service/developmentservice";
import "./development.css";

export default function Development() {

  /* ── shared ── */
  const [activeTab, setActiveTab]       = useState("create");
  const [masters, setMasters]           = useState([]);
  const [developments, setDevelopments] = useState([]);

  /* ── create tab ── */
  const [showTitleBox, setShowTitleBox] = useState(false);
  const [phases, setPhases] = useState([
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Phase 5",
]);

const [newPhaseName, setNewPhaseName] = useState("");

const [form, setForm] = useState({
  phaseNumber: "",
  masterId: "",
  description: "",
  status: "UPCOMING",
  startDate: "",
  endDate: "",
});
  const [images, setImages]   = useState([]);
  const [preview, setPreview] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newImage, setNewImage] = useState(null);

  /* ── edit tab ── */
  const [editSection, setEditSection] = useState("phases"); // "phases" | "titles"

  // Phase inline edit (only phase number changes)
  const [editingDevId, setEditingDevId] = useState(null);
  const [editPhaseNum, setEditPhaseNum] = useState("");
  const [editPhaseTitle, setEditPhaseTitle] =useState("");
  const [editCustomPh, setEditCustomPh] = useState("");

  // Title inline edit (only title text changes)
  const [editingMasterId, setEditingMasterId] = useState(null);
  const [editMasterTitle, setEditMasterTitle] = useState("");
  const [editMasterImage,setEditMasterImage] = useState(null);

  /* ── fetch ── */
  useEffect(() => { fetchMasters(); fetchDevelopments(); }, []);

  const fetchMasters      = async () => { const r = await getAllMasters();     setMasters(r.data); };
  const fetchDevelopments = async () => { const r = await getAllDevelopment(); setDevelopments(r.data); };

  /* ══════════════════════════════════════════
     CREATE TAB HANDLERS
  ══════════════════════════════════════════ */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 24) return alert("Maximum 24 images allowed");
    setImages(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };
const handleCreatePhase = () => {
  if (!newPhaseName.trim()) {
    return alert("Please enter phase name");
  }

  if (phases.includes(newPhaseName.trim())) {
    return alert("Phase already exists");
  }

  setPhases((prev) => [...prev, newPhaseName.trim()]);

  setForm((prev) => ({
    ...prev,
    phaseNumber: newPhaseName.trim(),
  }));

  setNewPhaseName("");

  alert("Phase Created Successfully ✅");
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd    = new FormData();
    fd.append(
  "phaseNumber",
  form.phaseNumber
);
    fd.append("masterId",    form.masterId);
    fd.append("description", form.description);
    fd.append("status",      form.status);
    fd.append("startDate",   form.startDate);
    fd.append("endDate",     form.endDate);
    images.forEach((img) => fd.append("images", img));
    await createDevelopment(fd);
    alert("Development Created Successfully ✅");
    setForm({
  phaseNumber: "",
  masterId: "",
  description: "",
  status: "UPCOMING",
  startDate: "",
  endDate: "",
});
    setImages([]); setPreview([]);
    fetchDevelopments();
  };

  const handleAddTitle = async () => {
    if (!newTitle || !newImage) return alert("Title & Image required");
    const fd = new FormData();
    fd.append("title", newTitle);
    fd.append("image", newImage);
    await createMaster(fd);
    alert("Title Added ✅");
    setNewTitle(""); setNewImage(null); setShowTitleBox(false);
    fetchMasters();
  };

  /* ══════════════════════════════════════════
     EDIT TAB — PHASE HANDLERS
  ══════════════════════════════════════════ */
  const startEditPhase = (dev) => {
    setEditingDevId(dev.id);
    // If existing phaseNumber is 1/2/3 keep as is, else treat as custom
    const known = ["1", "2", "3"];
    const ph    = String(dev.phaseNumber);
    if (known.includes(ph)) {
      setEditPhaseNum(ph);
      setEditCustomPh("");
      setEditPhaseTitle(
      dev.phaseTitle || ""
      );
    } else {
      setEditPhaseNum("custom");
      setEditCustomPh(ph);
    }
    setEditPhaseTitle(
  dev.phaseTitle || ""
);
  };

  const handleSavePhase = async (dev) => {
    const finalPhase = editPhaseNum === "custom" ? editCustomPh : editPhaseNum;
    if (!finalPhase) return alert("Please select or enter a phase number");
    const fd = new FormData();
    fd.append("phaseNumber", finalPhase);
    fd.append( "phaseTitle",editPhaseTitle);
    fd.append("masterId",    dev.masterId    ?? "");
    fd.append("description", dev.description ?? "");
    fd.append("status",      dev.status      ?? "UPCOMING");
    fd.append("startDate",   dev.startDate   ?? "");
    fd.append("endDate",     dev.endDate     ?? "");
    await updateDevelopment(dev.id, fd);
    alert("Phase updated ✅");
    setEditingDevId(null);
    fetchDevelopments();
  };

  const handleDeleteDev = async (id) => {
    if (!window.confirm("Are you sure you want to delete this phase?")) return;
    await deleteDevelopment(id);
    alert("Phase Deleted 🗑️");
    fetchDevelopments();
  };

  /* ══════════════════════════════════════════
     EDIT TAB — TITLE HANDLERS
  ══════════════════════════════════════════ */
  const startEditMaster = (master) => {
    setEditingMasterId(master.id);
    setEditMasterTitle(master.title);
    setEditMasterImage(null);
  };

const handleSaveMaster = async () => {

  if (!editMasterTitle.trim())
    return alert("Title cannot be empty");

  const fd = new FormData();

  fd.append("title", editMasterTitle);

  if (editMasterImage) {
    fd.append(
      "image",
      editMasterImage
    );
  }

  // Uses createMaster — swap to updateMaster(editingMasterId, fd)
  await createMaster(fd);

  alert("Title updated ✅");

  setEditingMasterId(null);

  fetchMasters();
};
  

  const handleDeleteMaster = async (id) => {
    if (!window.confirm("Are you sure you want to delete this title?")) return;
    // swap to deleteMaster(id) once that API is exported from service
    alert("Delete API for titles not yet available in service.");
  };

  /* ── helper ── */
  /* Unique Phases */

const uniquePhases = [
  ...new Map(

    developments.map(dev => [

      dev.phaseTitle ||
      dev.phaseNumber,

      dev

    ])

  ).values()
];
  const getMasterTitle = (id) => {
    const m = masters.find((m) => String(m.id) === String(id));
    return m ? m.title : "—";
  };
  <label className="file-label">
  Change Image
  <input
    type="file"
    onChange={(e) =>
      setEditMasterImage(
        e.target.files[0]
      )
    }
  />
</label>

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="dev-wrapper">

      {/* ── Tab Bar ── */}
      <div className="dev-tabs">
        <button className={`dev-tab ${activeTab === "create" ? "active" : ""}`} onClick={() => setActiveTab("create")}>Create</button>
        <button className={`dev-tab ${activeTab === "edit"   ? "active" : ""}`} onClick={() => setActiveTab("edit")}>Edit</button>
      </div>

      {/* ════════════════ CREATE TAB ════════════════ */}
      {activeTab === "create" && (
        <div className="card">
          <h2>Create Development</h2>
          <form onSubmit={handleSubmit} className="form">

            {/* Phase */}
            <select
  name="phaseNumber"
  value={form.phaseNumber}
  onChange={handleChange}
  required
>
  <option value="">Select Phase</option>

  {phases.map((phase) => (
    <option key={phase} value={phase}>
      {phase}
    </option>
  ))}
</select>

<div className="new-phase-box">
  <input
    type="text"
    placeholder="Create New Phase"
    value={newPhaseName}
    onChange={(e) =>
      setNewPhaseName(e.target.value)
    }
  />

  <button
    type="button"
    onClick={handleCreatePhase}
  >
    Create New Phase
  </button>
</div>

            {/* Title */}
            <select name="masterId" value={form.masterId} onChange={handleChange} required>
              <option value="">Select DevelopmentTitle</option>
              {masters.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>

            <button type="button" className="btn-outline" onClick={() => setShowTitleBox(!showTitleBox)}>
              + Add Development Title
            </button>
            {showTitleBox && (
              <div className="title-box">
                <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <input type="file" onChange={(e) => setNewImage(e.target.files[0])} />
                <button type="button" onClick={handleAddTitle}>Save Title</button>
              </div>
            )}

            {/* Rest of fields */}
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETE">Complete</option>
            </select>

            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            <input type="date" name="endDate"   value={form.endDate}   onChange={handleChange} />

            <div className="preview">
              {preview.map((src, i) => <img key={i} src={src} alt="preview" />)}
            </div>

            <button type="submit">Create Development</button>
          </form>
        </div>
      )}

      {/* ════════════════ EDIT TAB ════════════════ */}
      {activeTab === "edit" && (
        <div className="card">
          <h2>Edit</h2>

          {/* Sub-section pills */}
          <div className="edit-section-toggle">
            <button
              className={`toggle-btn ${editSection === "phases" ? "active" : ""}`}
              onClick={() => { setEditSection("phases"); setEditingDevId(null); }}
            >
              Phases
            </button>
            <button
              className={`toggle-btn ${editSection === "titles" ? "active" : ""}`}
              onClick={() => { setEditSection("titles"); setEditingMasterId(null); }}
            >
              Development Titles
            </button>
          </div>

          {/* ──────────── PHASES LIST ──────────── */}
          {editSection === "phases" && (
            <div className="edit-list">
              {developments.length === 0 && <p className="empty-msg">No phases found.</p>}

              {uniquePhases.map((dev) => (
                <div key={dev.id} className="edit-card">

                  {/* Collapsed row */}
                  {editingDevId !== dev.id && (
                    <div className="edit-card-row">
                      <div className="edit-card-info">

  <span className="edit-card-phase">
    {dev.phaseTitle
      ? dev.phaseTitle
      : `Phase ${dev.phaseNumber}`}
  </span>

</div>
                      <div className="edit-card-actions">
                        <button className="btn-edit"   onClick={() => startEditPhase(dev)}>✏️ Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteDev(dev.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}

                  {/* Expanded inline edit — only phase number */}
                  {editingDevId === dev.id && (
                    <div className="edit-inline">
                      <div className="edit-inline-header">
                        <span className="edit-inline-label">
                          Editing Phase for: <strong>{getMasterTitle(dev.masterId)}</strong>
                        </span>
                        <button className="btn-cancel" onClick={() => setEditingDevId(null)}>✕ Cancel</button>
                      </div>

                      <select value={editPhaseNum} onChange={(e) => { setEditPhaseNum(e.target.value); setEditCustomPh(""); }}>
                        <option value="">Select Phase</option>
                        <option value="1">Phase 1</option>
                        <option value="2">Phase 2</option>
                        <option value="3">Phase 3</option>
                        <option value="4">Phase 4</option>
                        <option value="5">Phase 5</option>
                        <option value="custom">Custom Phase</option>
                      </select>
<input
  placeholder="Phase Title"
  value={editPhaseTitle}
  onChange={(e) =>
    setEditPhaseTitle(e.target.value)
  }
/>
                      {editPhaseNum === "custom" && (
                        <input
                          type="number"
                          placeholder="Enter custom phase number"
                          value={editCustomPh}
                          onChange={(e) => setEditCustomPh(e.target.value)}
                        />
                      )}

                      <div className="edit-inline-actions">
                        <button className="btn-save" onClick={() => handleSavePhase(dev)}>💾 Save</button>
                        <button className="btn-cancel" onClick={() => setEditingDevId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ──────────── TITLES LIST ──────────── */}
          {editSection === "titles" && (
            <div className="edit-list">
              {masters.length === 0 && <p className="empty-msg">No titles found.</p>}

              {masters.map((master) => (
                <div key={master.id} className="edit-card">

                  {/* Collapsed row */}
                  {editingMasterId !== master.id && (
                    <div className="edit-card-row">
                      <div className="edit-card-info">
                        {master.imageUrl && (
                          <img src={master.imageUrl} alt={master.title} className="master-thumb" />
                        )}
                        <span className="edit-card-title">{master.title}</span>
                      </div>
                      <div className="edit-card-actions">
                        <button className="btn-edit"   onClick={() => startEditMaster(master)}>✏️ Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteMaster(master.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}

                  {/* Expanded inline edit — only title text */}
                  {editingMasterId === master.id && (
                    <div className="edit-inline">
                      <div className="edit-inline-header">
                        <span className="edit-inline-label">
                          Editing: <strong>{master.title}</strong>
                        </span>
                        <button className="btn-cancel" onClick={() => setEditingMasterId(null)}>✕ Cancel</button>
                      </div>

                      <input
                        value={editMasterTitle}
                        placeholder="Enter new title"
                        onChange={(e) => setEditMasterTitle(e.target.value)}
                      />
{master.imageUrl && !editMasterImage && (
  <div
    style={{
      marginTop: 12
    }}
  >
    <img
      src={master.imageUrl}
      alt=""
      style={{
        width: 100,
        height: 100,
        objectFit: "cover",
        borderRadius: 12,
        border: "1px solid #ddd"
      }}
    />
  </div>
)}

{editMasterImage && (
  <div
    style={{
      marginTop: 12
    }}
  >
    <img
      src={URL.createObjectURL(editMasterImage)}
      alt=""
      style={{
        width: 100,
        height: 100,
        objectFit: "cover",
        borderRadius: 12,
        border: "1px solid #ddd"
      }}
    />
  </div>
)}
                      <div className="edit-inline-actions">
                        <button className="btn-save" onClick={handleSaveMaster}>💾 Save</button>
                        <button className="btn-cancel" onClick={() => setEditingMasterId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
