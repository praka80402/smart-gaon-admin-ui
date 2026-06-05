import { useState, useEffect } from "react";
import { createVillage } from "./service/villageservice";
import { assignDevelopmentToVillage } from "./service/villageDevelopmentService";
import { getAllDevelopment, getByPhase } from "./service/developmentservice";
import "./createVillage.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePlace() {
  return {
    id: Date.now() + Math.random(),
    name: "",
    description: "",
    imageFile: null,
    youtube: "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function ProgressBar({ value }) {
  return (
    <div className="mv-progress-track">
      <div className="mv-progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function PopularPlaceItem({ place, index, onUpdate, onRemove }) {
  function set(key, val) {
    onUpdate({ ...place, [key]: val });
  }
  return (
    <div className="mv-popular-item">
      <div className="mv-popular-header">
        <span className="mv-popular-title">Place {index + 1}</span>
        <button type="button" className="mv-icon-btn" onClick={onRemove}>
          ✕
        </button>
      </div>
      <div className="mv-field">
        <label>Name of Place</label>
        <input
          type="text"
          value={place.name}
          placeholder="Enter place name"
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div className="mv-field">
        <label>Description</label>
        <textarea
          value={place.description}
          placeholder="Describe this place..."
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <label className="mv-small-label">Attachment</label>
      <div className="mv-attach-row">
        <label className="mv-attach-btn">
          <span>📷 Image</span>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => set("imageFile", e.target.files[0])}
          />
        </label>
        <button
          type="button"
          className="mv-attach-btn"
          onClick={() => {
            const url = prompt("Enter YouTube URL:");
            if (url) set("youtube", url);
          }}
        >
          ▶ YouTube
        </button>
      </div>
      {place.imageFile && (
        <p className="mv-attach-note">✓ {place.imageFile.name}</p>
      )}
      {place.youtube && (
        <p className="mv-attach-note">✓ YouTube: {place.youtube}</p>
      )}
    </div>
  );
}

// ─── Smart Gaon Phase Builder ─────────────────────────────────────────────────

function SmartGaonBuilder({ phases, onSelectionsChange }) {
  const [activePhase, setActivePhase] = useState(null);
  const [phaseDevelopments, setPhaseDevelopments] = useState([]);
  const [loadingDevs, setLoadingDevs] = useState(false);

  /**
   * selections: {
   *   [devId]: {
   *     dev,
   *     progress,
   *     photos: FileList | null,
   *     youtube: string,
   *     doc: File | null,
   *   }
   * }
   * Attachments are now per-development, not per-phase.
   */
  const [selections, setSelections] = useState({});

  async function handlePhaseClick(phaseNum) {
    if (activePhase === phaseNum) {
      setActivePhase(null);
      setPhaseDevelopments([]);
      return;
    }
    setActivePhase(phaseNum);
    setLoadingDevs(true);
    try {
      const res = await getByPhase(phaseNum);
      // Deduplicate by id
      const seen = new Set();
      const unique = (res.data || []).filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });
      setPhaseDevelopments(unique);
    } catch (e) {
      console.error(e);
      setPhaseDevelopments([]);
    } finally {
      setLoadingDevs(false);
    }
  }

  function toggleDev(dev) {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[dev.id]) {
        delete next[dev.id];
      } else {
        next[dev.id] = {
          dev,
          progress: 0,
          photos: null,
          youtube: "",
          doc: null,
        };
      }
      return next;
    });
  }

  function updateProgress(devId, value) {
    setSelections((prev) => ({
      ...prev,
      [devId]: { ...prev[devId], progress: value },
    }));
  }

  // Update a single attachment field on a specific development
  function updateDevAttachment(devId, key, val) {
    setSelections((prev) => ({
      ...prev,
      [devId]: { ...prev[devId], [key]: val },
    }));
  }

  // Notify parent whenever selections change
  useEffect(() => {
    onSelectionsChange(selections);
  }, [selections]);

  // Phase avg progress = avg of selected devs currently visible
  function calcPhasePct() {
    const selected = phaseDevelopments.filter((d) => selections[d.id]);
    if (!selected.length) return 0;
    return Math.round(
      selected.reduce((s, d) => s + (selections[d.id]?.progress || 0), 0) /
        selected.length
    );
  }

  const selectedCount = Object.keys(selections).length;
  const phasePct = activePhase !== null ? calcPhasePct() : 0;

  // Which phases have at least one selection (for pill dot indicator)
  const phasesWithSelections = new Set(
    Object.values(selections).map((s) => s.dev?.phaseNumber)
  );

  return (
    <div className="mv-sg-builder">
      {/* Phase pills */}
      <div className="mv-field">
        <label className="mv-small-label">
          Select a phase to view developments
        </label>
        <div className="mv-phase-pills">
          {phases.length === 0 && (
            <p className="mv-empty-hint">
              No phases found. Create phases in the Development section first.
            </p>
          )}
          {phases.map((ph) => (
            <button
              key={ph}
              type="button"
              className={`mv-phase-pill ${
                activePhase === ph ? "mv-phase-pill-active" : ""
              } ${phasesWithSelections.has(ph) ? "mv-phase-pill-has-selection" : ""}`}
              onClick={() => handlePhaseClick(ph)}
            >
              Phase {ph}
              {phasesWithSelections.has(ph) && (
                <span className="mv-phase-pill-dot" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Phase panel */}
      {activePhase !== null && (
        <div className="mv-phase-panel">
          {/* Phase header */}
          <div className="mv-phase-group-header">
            <span className="mv-phase-badge">Phase {activePhase}</span>
            <div className="mv-phase-group-progress">
              <ProgressBar value={phasePct} />
              <span className="mv-phase-pct">{phasePct}% complete</span>
            </div>
            {selectedCount > 0 && (
              <span
                className="mv-sg-summary-badge"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                {selectedCount} selected
              </span>
            )}
          </div>

          {loadingDevs && <p className="mv-loading">Loading developments…</p>}

          {!loadingDevs && phaseDevelopments.length === 0 && (
            <p className="mv-empty-hint">
              No developments found for this phase.
            </p>
          )}

          {/* Dev card grid */}
          {!loadingDevs && phaseDevelopments.length > 0 && (
            <div className="mv-dev-card-grid">
              {phaseDevelopments.map((dev) => {
                const isSelected = !!selections[dev.id];
                const sel = selections[dev.id] || {};
                const progress = sel.progress ?? 0;

                return (
                  <div
                    key={dev.id}
                    className={`mv-dev-card ${
                      isSelected ? "mv-dev-card-selected" : ""
                    }`}
                    onClick={() => toggleDev(dev)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Vertical progress bar */}
                    <div className="mv-dev-progress-col">
                      <div className="mv-vert-track">
                        <div
                          className="mv-vert-fill"
                          style={{
                            height: isSelected ? `${progress}%` : "0%",
                          }}
                        />
                      </div>
                      <span className="mv-pct-label">
                        {isSelected ? `${progress}%` : "—"}
                      </span>
                    </div>

                    {/* Card content */}
                    <div className="mv-dev-content">
                      <div className="mv-dev-card-top">
                        <input
                          type="checkbox"
                          className="mv-dev-checkbox"
                          checked={isSelected}
                          onChange={() => toggleDev(dev)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {dev.master?.imageUrl ? (
                        <img
                          src={dev.master.imageUrl}
                          alt=""
                          className="mv-dev-card-img"
                        />
                      ) : (
                        <div className="mv-dev-placeholder">🏗️</div>
                      )}

                      <p className="mv-dev-card-title">
                        {dev.master?.title || `Development #${dev.id}`}
                      </p>
                      <p className="mv-dev-card-status">{dev.status}</p>

                      {/* Progress slider + per-development attachments */}
                      {isSelected && (
                        <div
                          className="mv-progress-box"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Progress */}
                          <div className="mv-progress-head">
  <span>Progress</span>
  <span>{progress}%</span>
</div>

<input
  type="range"
  min={0}
  max={100}
  step={1}
  value={progress}
  className="mv-progress-slider"
  onChange={(e) =>
    updateProgress(dev.id, parseInt(e.target.value))
  }
/>

                          {/* Per-development attachments */}
                          <div className="mv-dev-attachments">
                            <p className="mv-small-label" style={{ marginTop: 10 }}>
                              Attachments
                            </p>
                            <div className="mv-attach-row">
                              {/* Photos */}
                              <label className="mv-attach-btn">
                                <span>📷 Photos</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    updateDevAttachment(
                                      dev.id,
                                      "photos",
                                      e.target.files
                                    )
                                  }
                                />
                              </label>
                              {sel.photos ? (
                                <span className="mv-attach-note">
                                  ✓ {sel.photos.length} photo(s)
                                </span>
                              ) : null}

                              {/* YouTube */}
                              <div className="mv-attach-btn-wrap">
                                <input
                                  type="url"
                                  className="mv-youtube-input"
                                  placeholder="YouTube URL"
                                  value={sel.youtube || ""}
                                  onChange={(e) =>
                                    updateDevAttachment(
                                      dev.id,
                                      "youtube",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              {sel.youtube ? (
                                <span className="mv-attach-note">
                                  ✓ YouTube linked
                                </span>
                              ) : null}

                              {/* Document */}
                              <label className="mv-attach-btn">
                                <span>📄 Document</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  style={{ display: "none" }}
                                  onChange={(e) =>
                                    updateDevAttachment(
                                      dev.id,
                                      "doc",
                                      e.target.files[0]
                                    )
                                  }
                                />
                              </label>
                              {sel.doc ? (
                                <span className="mv-attach-note">
                                  ✓ {sel.doc.name}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyVillage() {
  const [formData, setFormData] = useState({
    villageName: "",
    district: "",
    state: "",
    description: "",
  });
  const [villageImages, setVillageImages] = useState([]);

  const [popularEnabled, setPopularEnabled] = useState(false);
  const [popularPlaces, setPopularPlaces] = useState([]);

  const [smartGaonEnabled, setSmartGaonEnabled] = useState(false);

  const [apiPhases, setApiPhases] = useState([]);

  /**
   * sgSelections: {
   *   [devId]: { dev, progress, photos, youtube, doc }
   * }
   * Each development owns its own attachments.
   */
  const [sgSelections, setSgSelections] = useState({});

  const [submitting, setSubmitting] = useState(false);

  // Load phases on mount
  useEffect(() => {
    async function loadPhases() {
      try {
        const res = await getAllDevelopment();
        const uniquePhases = [
          ...new Set((res.data || []).map((d) => d.phaseNumber)),
        ].sort((a, b) => a - b);
        setApiPhases(uniquePhases);
      } catch (e) {
        console.error("Failed to load phases", e);
      }
    }
    loadPhases();
  }, []);

  // ─ handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePopularToggle = (checked) => {
    setPopularEnabled(checked);
    if (checked && popularPlaces.length === 0) setPopularPlaces([makePlace()]);
  };

  const addPopularPlace = () =>
    setPopularPlaces((prev) => [...prev, makePlace()]);
  const updatePopularPlace = (id, updated) =>
    setPopularPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
  const removePopularPlace = (id) =>
    setPopularPlaces((prev) => prev.filter((p) => p.id !== id));

  // SmartGaonBuilder now calls this with just selections (no separate phaseAttachments)
  const handleSgSelectionsChange = (sels) => {
    setSgSelections(sels);
  };

  // ─ submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.villageName.trim()) {
      alert("Village name is required.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Build village FormData
      const data = new FormData();
      data.append("name", formData.villageName);
      data.append("city", formData.district);
      data.append("state", formData.state);
      data.append("description", formData.description);
      data.append("smartGaon", smartGaonEnabled);
      data.append("popularPlace", popularEnabled);

      Array.from(villageImages).forEach((img) => data.append("images", img));

      data.append(
        "popularPlaces",
        JSON.stringify(
          popularPlaces.map((p, i) => ({
            index: i,
            name: p.name,
            description: p.description,
            youtube: p.youtube || "",
          }))
        )
      );
      popularPlaces.forEach((p, i) => {
        if (p.imageFile) data.append(`popularPlaceImage_${i}`, p.imageFile);
      });

      // 2. Create the village
      const villageRes = await createVillage(data);
      const createdVillageId = villageRes?.data?.id || villageRes?.id;

      // 3. Assign each selected development with its OWN attachments
      if (smartGaonEnabled && createdVillageId) {
        const assignPromises = Object.values(sgSelections).map(
          ({ dev, progress, photos, youtube, doc }) => {
            const fd = new FormData();
            fd.append("developmentId", dev.id);
            fd.append("progress", Number(progress));
            fd.append("videoUrl", youtube || "");
            if (photos)
              Array.from(photos).forEach((f) => fd.append("images", f));
            if (doc) fd.append("reports", doc);
            return assignDevelopmentToVillage(createdVillageId, fd);
          }
        );
        await Promise.all(assignPromises);
      }

      alert("Village Created Successfully ✅");
      handleClear();
    } catch (err) {
      console.error(err);
      alert("Failed to create village. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ villageName: "", district: "", state: "", description: "" });
    setVillageImages([]);
    setPopularEnabled(false);
    setPopularPlaces([]);
    setSmartGaonEnabled(false);
    setSgSelections({});
    const fi = document.getElementById("villageImages");
    if (fi) fi.value = "";
  };

  // ─ render ─────────────────────────────────────────────────────────────────

  const sgSelectedCount = Object.keys(sgSelections).length;

  return (
    <div className="mv-page-wrapper">
      <div className="mv-heading-wrapper">
        <h1 className="mv-main-heading">My Village</h1>
        <p className="mv-main-subheading">
          Add and manage your village details, popular places, and Smart Gaon
          phases.
        </p>
      </div>

      <form className="mv-form" onSubmit={handleSubmit}>
        {/* ── Village Details ── */}
        <div className="mv-card">
          <p className="mv-section-label">Village Details</p>

          <div className="mv-field">
            <label>Village Name *</label>
            <input
              type="text"
              name="villageName"
              value={formData.villageName}
              placeholder="Enter village name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mv-grid2">
            <div className="mv-field">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                placeholder="Enter district"
                onChange={handleChange}
              />
            </div>
            <div className="mv-field">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                placeholder="Enter state"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mv-field">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              placeholder="Write village details..."
              onChange={handleChange}
            />
          </div>

          <div className="mv-field">
            <label>Village Images</label>
            <input
              id="villageImages"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setVillageImages(e.target.files)}
            />
            {villageImages.length > 0 && (
              <p className="mv-attach-note">
                ✓ {villageImages.length} file(s) selected
              </p>
            )}
          </div>
        </div>

        {/* ── Popular Place ── */}
        <div className="mv-card">
          <div className="mv-toggle-row">
            <div className="mv-toggle-info">
              <h3>Popular Place</h3>
              <p>Highlight notable places in this village.</p>
            </div>
            <Toggle checked={popularEnabled} onChange={handlePopularToggle} />
          </div>

          {popularEnabled && (
            <div className="mv-section-body">
              {popularPlaces.map((place, i) => (
                <PopularPlaceItem
                  key={place.id}
                  place={place}
                  index={i}
                  onUpdate={(updated) => updatePopularPlace(place.id, updated)}
                  onRemove={() => removePopularPlace(place.id)}
                />
              ))}
              <button
                type="button"
                className="mv-add-dashed-btn"
                onClick={addPopularPlace}
              >
                + Add Popular Place
              </button>
            </div>
          )}
        </div>

        {/* ── Smart Gaon ── */}
        <div className="mv-card">
          <div className="mv-toggle-row">
            <div className="mv-toggle-info">
              <h3>Smart Gaon</h3>
              <p>Enable digital smart features and phased development tracking.</p>
            </div>
            <Toggle checked={smartGaonEnabled} onChange={setSmartGaonEnabled} />
          </div>

          {smartGaonEnabled && (
            <div className="mv-section-body">
              {sgSelectedCount > 0 && (
                <div className="mv-sg-summary-badge">
                  {sgSelectedCount} development
                  {sgSelectedCount !== 1 ? "s" : ""} selected
                </div>
              )}
              <SmartGaonBuilder
                phases={apiPhases}
                onSelectionsChange={handleSgSelectionsChange}
              />
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="mv-action-btns">
          <button type="button" className="mv-clear-btn" onClick={handleClear}>
            Clear
          </button>
          <button
            type="submit"
            className="mv-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Village"}
          </button>
        </div>
      </form>
    </div>
  );
}
