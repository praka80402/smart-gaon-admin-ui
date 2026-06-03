import { useEffect, useState, useRef } from "react";
import {
  getAllVillages,
  updateVillage,
  deleteVillage,
} from "./service/villageservice";
import {
  getVillageDevelopments,
  assignDevelopmentToVillage,
  updateVillageDevelopment,
  removeVillageDevelopment,
} from "./service/villageDevelopmentService";
import { getByPhase, getAllDevelopment } from "./service/developmentservice";
import EditDevelopmentModal from "./edit/EditDevelopmentModal";
import VillageView from "./edit/VillageView";
import StayEnquiry from "./stay-enquiry/StayEnquiry";
import "./VillageList.css";

/* ─── Toggle ──────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="mv-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="mv-slider" />
    </label>
  );
}

/* ─── DevCard ─────────────────────────────────────────────── */
function DevCard({ dev, sel, onToggle, onRemove, onUpdate, isNew }) {
  const checked = !!sel;
  const progress = sel?.progress ?? 0;

  return (
    <div style={{
      background: "#ffffff",
      border: checked ? "1.5px solid #1a7a4a" : "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 12,
      transition: "border-color 0.15s, box-shadow 0.15s",
      boxShadow: checked ? "0 1px 6px rgba(26,122,74,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          style={{
            width: 18, height: 18, accentColor: "#1a7a4a",
            flexShrink: 0, cursor: "pointer", borderRadius: 4,
          }}
        />
        <div style={{
          width: 72, height: 72, borderRadius: 10, overflow: "hidden",
          flexShrink: 0, background: "#f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {dev.master?.imageUrl
            ? <img src={dev.master.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 28 }}>🏗️</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, color: "#111827" }}>
            {dev.master?.title || `Development #${dev.id}`}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: "0.06em", fontWeight: 500 }}>
            {dev.status || "ONGOING"}
          </div>
        </div>
        {checked && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: isNew ? "#dbeafe" : "#dcfce7",
              color: isNew ? "#1d4ed8" : "#15803d",
              fontWeight: 600, letterSpacing: "0.03em",
            }}>
              {isNew ? "new" : "saved"}
            </span>
            {isNew && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                title="Remove"
                style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  color: "#9ca3af", fontSize: 20, lineHeight: 1, padding: "0 4px",
                }}
              >⋮</button>
            )}
          </div>
        )}
      </div>

      {/* Expanded section when selected */}
      {checked && sel && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{progress}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={progress}
              onChange={(e) => onUpdate("progress", parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#c87941", height: 4, cursor: "pointer" }}
            />
            
          </div>

          {/* Attachments */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
              Attachments
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Photos */}
              <div>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500,
                }}>
                  <span>📷</span> Photos
                  <input type="file" accept="image/*" multiple style={{ display: "none" }}
                    onChange={(e) => onUpdate("photos", e.target.files)} />
                </label>
                {sel.photos && (
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 4 }}>
                    ✓ {sel.photos.length} photo(s) selected
                  </div>
                )}
                
              </div>

              {/* YouTube URL */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8, background: "#f9fafb",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>▶</span>
                  <input
                    type="url" placeholder="YouTube URL"
                    value={sel.youtube || ""}
                    onChange={(e) => onUpdate("youtube", e.target.value)}
                    style={{
                      border: "none", background: "transparent", outline: "none",
                      fontSize: 13, color: "#374151", width: "100%", minWidth: 0,
                    }}
                  />
                </div>
                {sel.youtube ? (
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 4 }}>✓ YouTube linked</div>
                ) : sel.existingYoutube ? (
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Saved: {sel.existingYoutube}</div>
                ) : null}
              </div>

              {/* Document */}
              <div>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid #e5e7eb", background: "#f9fafb",
                  cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500,
                }}>
                  <span>📄</span> Document
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                    onChange={(e) => onUpdate("doc", e.target.files[0])} />
                </label>
                {sel.doc && (
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 4 }}>✓ {sel.doc.name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SmartGaonEditor ──────────────────────────────────────── */
function SmartGaonEditor({ villageId, assigned, onSave }) {
  const [allPhases, setAllPhases] = useState([]);
  const [populatedPhases, setPopulatedPhases] = useState([]);
  const [addedPhases, setAddedPhases] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [phaseDevelopments, setPhaseDevelopments] = useState([]);
  const [loadingDevs, setLoadingDevs] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [selections, setSelections] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowPhaseDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    async function loadAllPhases() {
      try {
        const res = await getAllDevelopment();
        const devs = res.data || [];
        const unique = [...new Set(devs.map((d) => d.phaseNumber))].sort((a, b) => a - b);
        setAllPhases(unique);
      } catch (e) { console.error(e); }
    }
    loadAllPhases();
  }, []);

  useEffect(() => {
    if (!assigned) return;
    const list = Array.isArray(assigned) ? assigned : assigned.data || [];
    const pre = {};
    list.forEach((item) => {
      if (!item.id) return;
     pre[String(item.id)] = {
  dev: item.development,
  phaseNumber: item.development?.phaseNumber ?? null,
  progress: item.progressPercent ?? item.progress ?? 0,
  assignmentId: item.id,

  photos: null,
  existingPhotos:
    item.images ||
    item.photos ||
    [],

  youtube: item.videoUrl || "",
  existingYoutube: item.videoUrl || "",

  doc: null,
  existingDoc:
    item.reportUrl ||
    item.documentUrl ||
    item.report ||
    "",
};
    });
    setSelections(pre);
    const phaseMap = {};
    list.forEach((item) => {
      const ph = item.development?.phaseNumber;
      if (ph == null) return;
      phaseMap[ph] = (phaseMap[ph] || 0) + 1;
    });
    const phases = Object.keys(phaseMap).map(Number).sort((a, b) => a - b);
    setPopulatedPhases(phases);
    if (phases.length > 0) loadPhase(phases[0]);
  }, [assigned]);

  async function loadPhase(phaseNum) {
    setActivePhase(phaseNum);
    setLoadingDevs(true);
    try {
      const res = await getByPhase(phaseNum);
      const seen = new Set();
      const unique = (res.data || []).filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id); return true;
      });
      setPhaseDevelopments(unique);
    } catch (e) {
      console.error(e); setPhaseDevelopments([]);
    } finally { setLoadingDevs(false); }
  }

  const displayedPhases = [...new Set([...populatedPhases, ...addedPhases])].sort((a, b) => a - b);
  const availableToAdd = allPhases.filter((p) => !displayedPhases.includes(p));

  function handleAddPhase(phaseNum) {
    setAddedPhases((prev) => [...prev, phaseNum]);
    setShowPhaseDropdown(false);
    loadPhase(phaseNum);
  }

  function phaseSelectionCount(phaseNum) {
    return Object.values(selections).filter((s) => s.phaseNumber === phaseNum).length;
  }

  function getExistingKeysForDev(devId) {
    return Object.entries(selections)
      .filter(([key, sel]) => sel.dev?.id === devId && !key.startsWith("new_"))
      .map(([key]) => key);
  }

  function getPendingKeyForDev(devId) {
    return Object.keys(selections).find((k) => k.startsWith(`new_${devId}_`)) || null;
  }

  function toggleDev(dev) {
    const pendingKey = getPendingKeyForDev(dev.id);
    setSelections((prev) => {
      const next = { ...prev };
      if (pendingKey) { delete next[pendingKey]; }
      else {
        const uid = Date.now();
        next[`new_${dev.id}_${uid}`] = {
          dev, phaseNumber: activePhase, progress: 0, assignmentId: null,
          photos: null, youtube: "", existingYoutube: "", doc: null,
        };
      }
      return next;
    });
  }

  function removeKey(key) {
    setSelections((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }

  function updateField(key, field, val) {
    setSelections((prev) => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  }

  async function handleSave() {
    if (!villageId) { alert("No village selected."); return; }
    setSaving(true);
    try {
      const promises = Object.values(selections).map(
        ({ dev, progress, assignmentId, photos, youtube, doc }) => {
          const fd = new FormData();
          fd.append("developmentId", dev.id);
          fd.append("progressPercent", Number(progress));
          fd.append("progress", Number(progress));
          fd.append("videoUrl", youtube || "");
          if (photos) Array.from(photos).forEach((f) => fd.append("images", f));
          if (doc) fd.append("reports", doc);
          return assignmentId
            ? updateVillageDevelopment(villageId, assignmentId, fd)
            : assignDevelopmentToVillage(villageId, fd);
        }
      );
      await Promise.all(promises);
      await onSave?.();
      alert("Smart Gaon updated ✅");
    } catch (e) {
      console.error(e); alert("Failed to update developments.");
    } finally { setSaving(false); }
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: "#111827" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a7a4a", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
        Smart Gaon – Phases &amp; Developments
      </h3>

      {/* Info banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: 10, padding: "10px 16px",
        fontSize: 13, color: "#15803d", marginBottom: 20,
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#1a7a4a",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>i</span>
        </div>
        Only phases that have at least one{" "}
        <span style={{ fontWeight: 600, textDecoration: "underline dotted" }}>development</span>{" "}
        are shown.
      </div>

      {/* Phase tabs row + Add Next Phase */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Phase tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {displayedPhases.length === 0 && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, alignSelf: "center" }}>
              No phases yet. Use "Add Next Phase" to begin.
            </p>
          )}
          {displayedPhases.map((ph) => {
            const count = phaseSelectionCount(ph);
            const isActive = activePhase === ph;
            return (
              <div
                key={ph}
                role="button" tabIndex={0}
                onClick={() => loadPhase(ph)}
                onKeyDown={(e) => e.key === "Enter" && loadPhase(ph)}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  border: isActive ? "2px solid #1a7a4a" : "1.5px solid #e5e7eb",
                  background: isActive ? "#ffffff" : "#fafafa",
                  cursor: "pointer", textAlign: "left", minWidth: 140,
                  transition: "all 0.15s", userSelect: "none", boxSizing: "border-box",
                  boxShadow: isActive ? "0 2px 8px rgba(26,122,74,0.12)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Phase {ph}</span>
                  {count > 0 && (
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", background: "#1a7a4a",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  {count === 1 ? "1 Development" : `${count} Developments`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Next Phase */}
        <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, letterSpacing: "0.04em" }}>
            Add Next Phase ▾
          </div>
          <div
            role="button" tabIndex={availableToAdd.length === 0 ? -1 : 0}
            onClick={() => availableToAdd.length > 0 && setShowPhaseDropdown((v) => !v)}
            onKeyDown={(e) => e.key === "Enter" && availableToAdd.length > 0 && setShowPhaseDropdown((v) => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 10, padding: "11px 14px",
              border: "1.5px solid #e5e7eb", borderRadius: 10,
              background: "#ffffff", cursor: availableToAdd.length === 0 ? "not-allowed" : "pointer",
              fontSize: 13, color: "#9ca3af", minWidth: 220,
              opacity: availableToAdd.length === 0 ? 0.5 : 1,
              userSelect: "none", boxSizing: "border-box",
            }}
          >
            <span>Select next phase to add</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {showPhaseDropdown && availableToAdd.length > 0 && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              background: "#ffffff", border: "1.5px solid #e5e7eb",
              borderRadius: 12, minWidth: 220, zIndex: 200,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", overflow: "hidden",
            }}>
              {availableToAdd.map((ph, i) => (
                <div
                  key={ph} role="button" tabIndex={0}
                  onClick={() => handleAddPhase(ph)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPhase(ph)}
                  style={{
                    padding: "11px 18px",
                    borderBottom: i < availableToAdd.length - 1 ? "1px solid #f3f4f6" : "none",
                    cursor: "pointer", fontSize: 14, color: "#111827",
                    userSelect: "none", boxSizing: "border-box", background: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Phase {ph}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Development cards for active phase */}
      {activePhase !== null && (
        <div>
          {loadingDevs && (
            <p style={{ fontSize: 13, color: "#6b7280" }}>Loading developments…</p>
          )}
          {!loadingDevs && phaseDevelopments.length === 0 && (
            <p style={{ fontSize: 13, color: "#6b7280" }}>No developments found for Phase {activePhase}.</p>
          )}
          {!loadingDevs && phaseDevelopments.map((dev) => {
            const existingKeys = getExistingKeysForDev(dev.id);
            const pendingKey = getPendingKeyForDev(dev.id);
            const allKeys = [...existingKeys, ...(pendingKey ? [pendingKey] : [])];
            const isSelected = allKeys.length > 0;
            return (
              <div key={dev.id}>
                {!isSelected && (
                  <DevCard dev={dev} sel={null} onToggle={() => toggleDev(dev)}
                    onRemove={null} onUpdate={null} isNew={false} />
                )}
                {allKeys.map((key) => {
                  const sel = selections[key];
                  if (!sel) return null;
                  const keyIsNew = key.startsWith("new_");
                  return (
                    <DevCard key={key} dev={dev} sel={sel}
                      onToggle={() => { if (keyIsNew) toggleDev(dev); }}
                      onRemove={keyIsNew ? () => removeKey(key) : null}
                      onUpdate={(field, val) => updateField(key, field, val)}
                      isNew={keyIsNew}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button type="button" className="mv-submit-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Update Developments"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIDEBAR NAV ITEM
══════════════════════════════════════════════ */
function SidebarNavItem({ icon, label, active, onClick }) {
  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 16px", borderRadius: 10, cursor: "pointer",
        background: active ? "#f0fdf4" : "transparent",
        color: active ? "#1a7a4a" : "#6b7280",
        fontWeight: active ? 600 : 400, fontSize: 14,
        transition: "all 0.15s", userSelect: "none",
        borderLeft: active ? "3px solid #1a7a4a" : "3px solid transparent",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function VillageList() {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [viewVillage, setViewVillage] = useState(null);
  const [form, setForm] = useState({});
  const [assigned, setAssigned] = useState([]);

  const [editDev, setEditDev] = useState(null);
  const [editProgress, setEditProgress] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [existingReports, setExistingReports] = useState([]);
  const [newReports, setNewReports] = useState([]);

  const [activeTab, setActiveTab] = useState("village");
  const [activeSidebarTab, setActiveSidebarTab] = useState("smartgaon");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchVillages(); }, []);

  const fetchVillages = async () => {
    const res = await getAllVillages();
    setVillages(res.data || []);
  };

  function normalizeAssignments(raw) {
    return Array.isArray(raw) ? raw : raw?.data || [];
  }

  const handleView = async (v) => {
    try {
      const raw = await getVillageDevelopments(v.id);
      setViewVillage({ ...v, developments: normalizeAssignments(raw) });
    } catch (e) { setViewVillage({ ...v, developments: [] }); }
  };

  const handleEdit = async (v) => {
    setSelectedVillage(v);
    setForm({ ...v });
    setActiveSidebarTab("basic");
    if (v.smartGaon) {
      try {
        const raw = await getVillageDevelopments(v.id);
        setAssigned(normalizeAssignments(raw));
      } catch (e) { setAssigned([]); }
    } else { setAssigned([]); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this village?")) {
      await deleteVillage(id);
      fetchVillages();
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateVillage(selectedVillage.id, {
        name: form.name, city: form.city, state: form.state,
        description: form.description, smartGaon: form.smartGaon ?? false,
      });
      alert("Village updated successfully ✅");
      fetchVillages();
      setSelectedVillage(null);
      setAssigned([]);
    } catch (e) { console.error(e); alert("Failed to update village."); }
    finally { setUpdating(false); }
  };

  const handleCloseEdit = () => {
    setSelectedVillage(null);
    setAssigned([]);
    setForm({});
  };

  const filteredVillages = villages.filter((v) =>
    activeTab === "smart" ? v.smartGaon === true : v.smartGaon === false
  );

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #e5e7eb", borderRadius: 10,
    fontSize: 14, color: "#111827", background: "#ffffff",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Outfit', sans-serif",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "#374151",
    marginBottom: 6, display: "block", letterSpacing: "0.02em",
  };

  return (
    <div className="village-list-container" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <h2>All Villages</h2>

      <div className="village-tabs">
        <button className={activeTab === "village" ? "active-tab" : ""} onClick={() => setActiveTab("village")}>Villages</button>
        <button className={activeTab === "smart" ? "active-tab" : ""} onClick={() => setActiveTab("smart")}>Smart Villages</button>
        <button className={activeTab === "stay" ? "active-tab" : ""} onClick={() => setActiveTab("stay")}>Stay Enquiry</button>
      </div>

      {activeTab !== "stay" && (
        <div className="village-cards-wrapper">
          {filteredVillages.map((v) => (
            <div className="village-card-item" key={v.id}>
              <div className="village-card-left">
                <div className="village-avatar">{v.name?.charAt(0)}</div>
                <div className="village-info">
                  <div className="village-name-row">
                    <span className="village-name">{v.name}</span>
                    {v.smartGaon ? <span className="smart-badge">SMART</span> : <span className="no-badge">Normal</span>}
                  </div>
                  <div className="village-meta">
                    <span>📍 {v.city}</span>
                    <span>🗺️ {v.state}</span>
                  </div>
                </div>
              </div>
              <div className="village-card-actions">
                <button className="btn-view" onClick={() => handleView(v)}>View</button>
                <button className="btn-edit" onClick={() => handleEdit(v)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(v.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "stay" && <StayEnquiry />}

      {/* ══════════════════════════════════════════
          EDIT MODAL — New two-panel layout
      ══════════════════════════════════════════ */}
      {selectedVillage && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "#f8fafc", borderRadius: 20,
            width: "100%", maxWidth: 1100, height: "90vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}>
            {/* ── Header ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 28px", background: "#ffffff",
              borderBottom: "1.5px solid #f0f0f0",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={{
                    border: "none", background: "transparent", cursor: "pointer",
                    width: 34, height: 34, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#374151", fontSize: 18,
                  }}
                >←</button>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Edit Village</span>
              </div>
            </div>

            {/* ── Body: sidebar + content ── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

              {/* Left Sidebar */}
              <div style={{
                width: 260, flexShrink: 0, background: "#ffffff",
                borderRight: "1.5px solid #f0f0f0",
                display: "flex", flexDirection: "column",
                overflow: "auto",
              }}>
                {/* Basic Info section in sidebar */}
                <div style={{ padding: "20px 20px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 14 }}>
                    BASIC INFORMATION
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Village Name</label>
                    <input
                      type="text" value={form.name || ""} placeholder="Village name"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#1a7a4a")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>District</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.city || ""}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
                      >
                        <option value="">Select district</option>
                        <option value={form.city || ""}>{form.city || ""}</option>
                      </select>
                      <span style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)", pointerEvents: "none",
                        color: "#9ca3af", fontSize: 13,
                      }}>▾</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>State</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.state || ""}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        style={{ ...inputStyle, appearance: "none", paddingRight: 36, cursor: "pointer" }}
                      >
                        <option value="">Select state</option>
                        <option value={form.state || ""}>{form.state || ""}</option>
                      </select>
                      <span style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)", pointerEvents: "none",
                        color: "#9ca3af", fontSize: 13,
                      }}>▾</span>
                    </div>
                  </div>

                  {/* Home Page Image */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Home Page Image</label>
                    {form.imageUrl ? (
                      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 120 }}>
                        <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imageUrl: null })}
                          style={{
                            position: "absolute", top: 6, right: 6,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "rgba(0,0,0,0.55)", border: "none",
                            color: "white", cursor: "pointer", fontSize: 12,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >✕</button>
                      </div>
                    ) : (
                      <div style={{
                        height: 80, border: "1.5px dashed #d1d5db", borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#9ca3af", fontSize: 13, cursor: "pointer", background: "#fafafa",
                      }}>
                        Drop image here
                      </div>
                    )}
                    <label style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      marginTop: 8, padding: "9px 0", borderRadius: 8,
                      border: "1.5px solid #e5e7eb", cursor: "pointer",
                      fontSize: 13, color: "#374151", fontWeight: 500, background: "#ffffff",
                    }}>
                      ↑ Change Image
                      <input type="file" accept="image/*" style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setForm({ ...form, imageUrl: URL.createObjectURL(f) });
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Nav links */}
                <div style={{ padding: "0 12px 12px", flex: 1 }}>
                  {[
                    { id: "basic", icon: "👤", label: "Basic Information" },
                    { id: "smartgaon", icon: "📊", label: "Smart Gaon" },
                    { id: "places", icon: "📍", label: "Popular Places" },
                  ].map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      active={activeSidebarTab === item.id}
                      onClick={() => setActiveSidebarTab(item.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Right Content Area */}
              <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>

                {activeSidebarTab === "basic" && (
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 20 }}>
                      Basic Information
                    </h3>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={form.description || ""} placeholder="Village description…"
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        style={{
                          ...inputStyle, minHeight: 100, resize: "vertical",
                          lineHeight: 1.6, fontFamily: "'Outfit', sans-serif",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#1a7a4a")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      />
                    </div>
                  </div>
                )}

                {activeSidebarTab === "smartgaon" && (
                  <div>
                    {/* Smart Gaon toggle */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 20px", background: "#ffffff",
                      border: "1.5px solid #e5e7eb", borderRadius: 14, marginBottom: 24,
                    }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
                          Smart Gaon
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          Enable phased development tracking for this village.
                        </div>
                      </div>
                      <Toggle
                        checked={form.smartGaon || false}
                        onChange={(checked) => setForm({ ...form, smartGaon: checked })}
                      />
                    </div>

                    {form.smartGaon && (
                      <>
                        <SmartGaonEditor
                          key={selectedVillage.id}
                          villageId={selectedVillage.id}
                          assigned={assigned}
                          onSave={async () => {
                            const raw = await getVillageDevelopments(selectedVillage.id);
                            setAssigned(normalizeAssignments(raw));
                          }}
                        />
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
                            const raw = await getVillageDevelopments(selectedVillage.id);
                            setAssigned(normalizeAssignments(raw));
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

                {activeSidebarTab === "places" && (
                  <div style={{ color: "#6b7280", fontSize: 14 }}>Popular Places section coming soon.</div>
                )}
               
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              gap: 12, padding: "16px 28px",
              background: "#ffffff", borderTop: "1.5px solid #f0f0f0",
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={handleCloseEdit}
                style={{
                  padding: "10px 24px", borderRadius: 10,
                  border: "1.5px solid #e5e7eb", background: "#ffffff",
                  fontSize: 14, fontWeight: 500, color: "#374151",
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                }}
              >Cancel</button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={updating}
                style={{
                  padding: "10px 28px", borderRadius: 10,
                  border: "none", background: updating ? "#9ca3af" : "#1a7a4a",
                  fontSize: 14, fontWeight: 600, color: "#ffffff",
                  cursor: updating ? "not-allowed" : "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  transition: "background 0.15s",
                }}
              >
                {updating ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewVillage && (
        <div className="modal-overlay" onClick={() => setViewVillage(null)}>
          <div className="modal-box-large" onClick={(e) => e.stopPropagation()}>
            <button className="view-modal-close-btn" onClick={() => setViewVillage(null)}>✕</button>
            <VillageView village={viewVillage} />
          </div>
        </div>
      )}
    </div>
  );
}
