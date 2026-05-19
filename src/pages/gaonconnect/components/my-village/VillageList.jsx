
import { useEffect, useState } from "react";

import {
  getAllVillages,
  updateVillage,
  deleteVillage,
} from "./service/villageservice";

import {
  getVillageDevelopments,
  assignDevelopmentToVillage,
} from "./service/villageDevelopmentService";

import {
  getAllDevelopment,
  getByPhase,
} from "./service/developmentservice";

import EditDevelopmentModal from "./edit/EditDevelopmentModal";
import VillageView from "./edit/VillageView";
import StayEnquiry from "./stay-enquiry/StayEnquiry";

import "./VillageList.css";

const getVillagePhaseStorageKey = (villageId) =>
  `smartgaon_custom_phases_${villageId}`;

/* ══════════════════════════════════════════════
   SMART GAON SECTION — inline inside Edit Modal
══════════════════════════════════════════════ */
function SmartGaonSection({
  selectedVillage, assigned, setAssigned,
  phases, getByPhase,
  editDev, setEditDev,
  editProgress, setEditProgress,
  editRemarks, setEditRemarks,
  existingImages, setExistingImages,
  newImages, setNewImages,
  videoUrl, setVideoUrl,
  existingReports, setExistingReports,
  newReports, setNewReports,
}) {

  const [activePhase, setActivePhase] = useState("");
  const [projects, setProjects]       = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [progress, setProgress]       = useState(0);
  const [images, setImages]           = useState([]);
  const [ytUrl, setYtUrl]             = useState("");

  // Phase Management States
  const [phaseNames, setPhaseNames] = useState({});
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [managedPhases, setManagedPhases] = useState([]);

  useEffect(() => {
    if (!selectedVillage?.id) {
      setManagedPhases([]);
      setPhaseNames({});
      return;
    }

    try {
      const saved = localStorage.getItem(
        getVillagePhaseStorageKey(selectedVillage.id)
      );

      if (!saved) {
        setManagedPhases([]);
        setPhaseNames({});
        return;
      }

      const parsed = JSON.parse(saved);

      setManagedPhases(
        Array.isArray(parsed?.phases)
          ? parsed.phases
              .map((phase) => Number(phase))
              .filter((phase) => Number.isFinite(phase))
              .sort((a, b) => a - b)
          : []
      );

      setPhaseNames(
        parsed?.phaseNames && typeof parsed.phaseNames === "object"
          ? parsed.phaseNames
          : {}
      );
    } catch (error) {
      console.error("Failed to load saved custom phases", error);
      setManagedPhases([]);
      setPhaseNames({});
    }
  }, [selectedVillage?.id]);

  useEffect(() => {
    if (!selectedVillage?.id) return;

    localStorage.setItem(
      getVillagePhaseStorageKey(selectedVillage.id),
      JSON.stringify({
        phases: managedPhases,
        phaseNames,
      })
    );
  }, [managedPhases, phaseNames, selectedVillage?.id]);

  const handlePhaseClick = async (p) => {
    setActivePhase(p);
    setSelectedProject(null);
    const res = await getByPhase(p);
    setProjects(res.data || []);
  };

  // Phase Management Functions
  const getPhaseLabel = (phaseNum) => {
    return phaseNames[phaseNum] || `Phase ${phaseNum}`;
  };

  const handleAddPhase = () => {
    const nextPhaseNum = Math.max(...managedPhases, ...phases, 0) + 1;
    setNewPhaseName(`Phase ${nextPhaseNum}`);
    setShowPhaseModal(true);
  };

  const handleSavePhase = () => {
    if (!newPhaseName.trim()) return alert("Phase name required");
    const nextPhaseNum = Math.max(...managedPhases, ...phases, 0) + 1;
    setManagedPhases(prev => [...prev, nextPhaseNum].sort((a,b) => a-b));
    setPhaseNames(prev => ({
      ...prev,
      [nextPhaseNum]: newPhaseName.trim()
    }));
    setShowPhaseModal(false);
    setNewPhaseName("");
  };


  // Get combined phases list
  const allPhases = [...new Set([...phases, ...managedPhases])].sort((a, b) => a - b);

  const handleAssign = async () => {
    if (!selectedProject) return alert("Select a development");
    const fd = new FormData();
    fd.append("developmentId", selectedProject.id);
    fd.append("progress", Number(progress));
    fd.append("videoUrl", ytUrl || "");
    images.forEach(img => fd.append("images", img));
    try {
      await assignDevelopmentToVillage(selectedVillage.id, fd);
      alert("Smart Gaon Created ✅");
      const data = await getVillageDevelopments(selectedVillage.id);
      setAssigned(data);
      setSelectedProject(null); setProgress(0);
      setImages([]); setYtUrl("");
    } catch (e) {
      console.error(e);
      alert("Failed. Try again.");
    }
  };

  const handleClear = () => {
    setActivePhase(""); setProjects([]);
    setSelectedProject(null); setProgress(0);
    setImages([]); setYtUrl("");
  };

  return (
    <div className="sg-section">

      <div className="sg-section-divider" />

      {/* ── Assigned Developments (row cards like Image 2) ── */}
      {assigned.length > 0 && (
        <div className="sg-assigned-wrap">
          <h4 className="sg-sub-head">📋 Assigned Developments</h4>
          {assigned.map(item => (
            <div className="sg-dev-row-card" key={item.id}>
              <div className="sg-dev-row-left">
                <div className="sg-dev-thumb">
                  {item.development.master?.imageUrl
                    ? <img src={item.development.master.imageUrl} alt="" />
                    : <span>🏗️</span>
                  }
                </div>
                <div>
                  <div className="sg-dev-row-title">{item.development.master?.title}</div>
                  <div className="sg-dev-row-phase">{getPhaseLabel(item.development.phaseNumber)}</div>
                  <div className="sg-dev-row-progress">
                    <div className="sg-mini-bar">
                      <div className="sg-mini-fill" style={{ width: `${item.progressPercent}%` }} />
                    </div>
                    <span>{item.progressPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EditDevelopmentModal */}
      <EditDevelopmentModal
        selectedVillage={selectedVillage}
        editDev={editDev} setEditDev={setEditDev}
        editProgress={editProgress} setEditProgress={setEditProgress}
        editRemarks={editRemarks} setEditRemarks={setEditRemarks}
        existingImages={existingImages} setExistingImages={setExistingImages}
        newImages={newImages} setNewImages={setNewImages}
        videoUrl={videoUrl} setVideoUrl={setVideoUrl}
        existingReports={existingReports} setExistingReports={setExistingReports}
        newReports={newReports} setNewReports={setNewReports}
        refreshDevelopment={async () => {
          const data = await getVillageDevelopments(selectedVillage.id);
          setAssigned(data);
        }}
      />

      <div className="sg-section-divider" />

      {/* ── Phase Management Header ── */}
      <div className="sg-phase-management">
        <h4 className="sg-label">📊 Manage Phases</h4>
        <button
          type="button"
          className="sg-add-phase-modal-btn"
          onClick={handleAddPhase}
        >
          ➕ Add Phase
        </button>
      </div>

      {/* ── Phase Management Modal ── */}
      {showPhaseModal && (
        <div className="sg-modal-overlay" onClick={() => setShowPhaseModal(false)}>
          <div className="sg-modal-box" onClick={e => e.stopPropagation()}>
            <div className="sg-modal-header">
              <h3>Add New Phase</h3>
              <button className="sg-modal-close" onClick={() => setShowPhaseModal(false)}>✕</button>
            </div>
            <div className="sg-modal-body">
              <label className="sg-label">Phase Name</label>
              <input
                type="text"
                className="sg-input"
                value={newPhaseName}
                onChange={e => setNewPhaseName(e.target.value)}
                placeholder="e.g. Foundation, Infrastructure, etc."
              />
            </div>
            <div className="sg-modal-footer">
              <button
                type="button"
                className="sg-modal-cancel-btn"
                onClick={() => setShowPhaseModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sg-modal-save-btn"
                onClick={handleSavePhase}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase Pills ── */}
      <div className="sg-field">
        <label className="sg-label">Choose Phase</label>
        <div className="sg-phase-pills">
          {allPhases.map(p => (
            <button
              key={p}
              type="button"
              className={`sg-phase-pill ${activePhase === String(p) ? "sg-phase-active" : ""}`}
              onClick={() => handlePhaseClick(String(p))}
            >
              {getPhaseLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects list (after phase selected) ── */}
      {projects.length > 0 && (
        <div className="sg-field">
          <label className="sg-label">Choose Development</label>
          <div className="sg-project-list">
            {projects.map(p => (
              <label
                key={p.id}
                className={`sg-project-item ${selectedProject?.id === p.id ? "sg-project-active" : ""}`}
              >
                <input type="radio" name="sg-project"
                  checked={selectedProject?.id === p.id}
                  onChange={() => setSelectedProject(p)}
                  style={{ display: "none" }}
                />
                <span className="sg-project-dot" />
                <span className="sg-project-name">{p.master?.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress Slider ── */}
      <div className="sg-field">
        <label className="sg-label">
          Add Progress
          <span className="sg-progress-badge">{progress}%</span>
        </label>
        <input type="range" min="0" max="100" value={progress}
          onChange={e => setProgress(e.target.value)}
          className="sg-slider"
        />
        <div className="sg-slider-marks">
          {[0,25,50,75,100].map(v => <span key={v}>{v}</span>)}
        </div>
      </div>

      {/* ── Media ── */}
      <div className="sg-media-box">
        <h5 className="sg-media-title">📎 Media</h5>

        <div className="sg-field">
          <label className="sg-label">Add Image (max 10)</label>
          <label className="sg-file-label">
            🖼️ {images.length > 0 ? `${images.length} selected` : "Choose Images"}
            <input type="file" multiple accept="image/*" style={{ display: "none" }}
              onChange={e => setImages(Array.from(e.target.files).slice(0, 10))}
            />
          </label>
          {images.length > 0 && (
            <div className="sg-img-preview">
              {images.map((img, i) => (
                <img key={i} src={URL.createObjectURL(img)} alt="prev" />
              ))}
            </div>
          )}
        </div>

        <div className="sg-field">
          <label className="sg-label">Add Video (Paste YouTube URL)</label>
          <input className="sg-input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={ytUrl}
            onChange={e => setYtUrl(e.target.value)}
          />
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="sg-action-row">
        <button type="button" className="sg-clear-btn" onClick={handleClear}>Clear</button>
        <button type="button" className="sg-submit-btn" onClick={handleAssign}>
          🏘️Update SmartGaon
        </button>
      </div>

    </div>
  );
}


export default function VillageList() {

  const [villages,setVillages] = useState([]);
  const [selectedVillage,setSelectedVillage] = useState(null);
  const [viewVillage,setViewVillage] = useState(null);

  const [form,setForm] = useState({});
  const [assigned,setAssigned] = useState([]);

  const [phases,setPhases] = useState([]);

  const [editDev,setEditDev] = useState(null);
  const [editProgress,setEditProgress] = useState("");
  const [editRemarks,setEditRemarks] = useState("");

  const [existingImages,setExistingImages] = useState([]);
  const [newImages,setNewImages] = useState([]);

  const [videoUrl,setVideoUrl] = useState("");

  const [existingReports,setExistingReports] = useState([]);
  const [newReports,setNewReports] = useState([]);

  const [activeTab, setActiveTab] = useState("village");

  useEffect(()=>{
    fetchVillages();
    fetchPhases();
  },[]);

  const fetchVillages = async ()=>{
    const res = await getAllVillages();
    setVillages(res.data);
  };

  const fetchPhases = async ()=>{

    const res = await getAllDevelopment();

    const uniquePhases = [
      ...new Set(res.data.map(d=>d.phaseNumber))
    ];

    uniquePhases.sort((a,b)=>a-b);

    setPhases(uniquePhases);
  };

  const handleView = (v)=>{
    setViewVillage(v);
  };

  const handleEdit = async(v)=>{

    setSelectedVillage(v);
    setForm({...v});

    if(v.smartGaon){

      const data = await getVillageDevelopments(v.id);
      setAssigned(data);

    }else{

      setAssigned([]);

    }
  };

  const handleDelete = async(id)=>{

    if(window.confirm("Delete this village?")){

      await deleteVillage(id);

      fetchVillages();
    }
  };

  const handleUpdate = async()=>{

    const payload = {
      name: form.name,
      city: form.city,
      state: form.state,
      description: form.description,
      smartGaon: form.smartGaon
    };

    await updateVillage(selectedVillage.id,payload);

    alert("Village Updated Successfully");

    fetchVillages();

    setSelectedVillage(null);
  };

  const filteredVillages = villages.filter(v =>
  activeTab === "smart"
    ? v.smartGaon === true
    : v.smartGaon === false
);

  return (

    <div className="village-list-container">

      <h2>All Villages</h2>

      <div className="village-tabs">
        <button
          className={activeTab === "village" ? "active-tab" : ""}
          onClick={() => setActiveTab("village")}
        >
          Villages
        </button>

        <button
          className={activeTab === "smart" ? "active-tab" : ""}
          onClick={() => setActiveTab("smart")}
        >
          Smart Villages
        </button>

        <button
          className={activeTab === "stay" ? "active-tab" : ""}
          onClick={() => setActiveTab("stay")}
        >
          Stay Enquiry
        </button>
      </div>

      {/* Village / Smart Villages Card List */}
      {activeTab !== "stay" && (
        <div className="village-cards-wrapper">
          {filteredVillages.length === 0 ? (
            <div className="empty-state">🏘️ No villages found.</div>
          ) : (
            filteredVillages.map((v) => (
              <div className="village-card-item" key={v.id}>

                {/* Left: Avatar + Info */}
                <div className="village-card-left">
                  <div className="village-avatar">
                    {v.name ? v.name.charAt(0) : "V"}
                  </div>
                  <div className="village-info">
                    <div className="village-name-row">
                      <span className="village-name">{v.name}</span>
                      {v.smartGaon
                        ? <span className="smart-badge">SMART</span>
                        : <span className="no-badge">Normal</span>
                      }
                    </div>
                    <div className="village-meta">
                      <span className="village-meta-item">
                        <span className="meta-icon">📍</span>
                        {v.city}
                      </span>
                      <span className="village-meta-item">
                        <span className="meta-icon">🗺️</span>
                        {v.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="village-card-actions">
                  <button className="btn-view" onClick={() => handleView(v)}>View</button>
                  <button className="btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(v.id)}>Delete</button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "stay" && <StayEnquiry />}


      {/* EDIT MODAL */}

      {selectedVillage && (

        <div className="modal-overlay">

          <div className="modal-box-large">

            <button
              className="close-btn"
              onClick={()=>setSelectedVillage(null)}
            >
              ✕
            </button>

            <h3>Edit Village</h3>

            <input
              value={form.name || ""}
              onChange={(e)=>
                setForm({...form,name:e.target.value})
              }
              placeholder="Village Name"
            />

            <input
              value={form.city || ""}
              onChange={(e)=>
                setForm({...form,city:e.target.value})
              }
              placeholder="City"
            />

            <input
              value={form.state || ""}
              onChange={(e)=>
                setForm({...form,state:e.target.value})
              }
              placeholder="State"
            />

            <textarea
              value={form.description || ""}
              onChange={(e)=>
                setForm({...form,description:e.target.value})
              }
              placeholder="Description"
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={form.smartGaon || false}
                onChange={(e)=>
                  setForm({...form, smartGaon: e.target.checked})
                }
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer"
                }}
              />

              Smart Gaon
            </label>

          
              <button onClick={handleUpdate}>
              Update Village
            </button>

            {form.smartGaon && (
              <SmartGaonSection
                selectedVillage={selectedVillage}
                assigned={assigned}
                setAssigned={setAssigned}
                phases={phases}
                getByPhase={getByPhase}
                editDev={editDev}
                setEditDev={setEditDev}
                editProgress={editProgress}
                setEditProgress={setEditProgress}
                editRemarks={editRemarks}
                setEditRemarks={setEditRemarks}
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                newImages={newImages}
                setNewImages={setNewImages}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                existingReports={existingReports}
                setExistingReports={setExistingReports}
                newReports={newReports}
                setNewReports={setNewReports}
              />
            )}

          </div>

        </div>

      )}

{viewVillage && (

  <div className="modal-overlay" onClick={() => setViewVillage(null)}>

    <div className="modal-box-large" onClick={e => e.stopPropagation()}>
      <button
        className="view-modal-close-btn"
        onClick={() => setViewVillage(null)}
      >
        ✕
      </button>
      <VillageView village={viewVillage} />
    </div>

  </div>

)}
    </div>
  );
}
