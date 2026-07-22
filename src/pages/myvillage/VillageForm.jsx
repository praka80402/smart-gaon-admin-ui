import { useEffect, useState } from "react";
import { getAllDevelopments } from "./services/developmentService";
import { fileToBase64, filesToBase64 } from "./services/config";
import { Toggle } from "./ui";


function makePlace() {
  return { key: Date.now() + Math.random(), name: "", description: "", photos: [], videoUrl: "" };
}

export default function VillageForm({ initial, submitLabel, onSubmit, submitting, activeSection }) {
  // When activeSection is set (edit modal), render only that section.
  // When undefined (create page), render all sections.
  const show = (sec) => !activeSection || activeSection === sec;
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // base64 strings — village details allows only ONE

  const [popularEnabled, setPopularEnabled] = useState(false);
  const [places, setPlaces] = useState([]);

  const [smartEnabled, setSmartEnabled] = useState(false);
  const [stayEnquiry, setStayEnquiry] = useState(false);
  const [catalogue, setCatalogue] = useState([]); // all developments
  const [activePhase, setActivePhase] = useState(null);
  // assignments keyed by developmentId:
  // { [devId]: { dev, progressPercent, images:[base64], videoUrl, document } }
  const [assignments, setAssignments] = useState({});

  // Load the global catalogue
  useEffect(() => {
    getAllDevelopments()
      .then((res) => setCatalogue(res.data || []))
      .catch((e) => console.error(e));
  }, []);

  // Hydrate from `initial` (edit mode)
  useEffect(() => {
    if (!initial) return;
    setName(initial.name || "");
    setDistrict(initial.district || initial.city || "");
    setState(initial.state || "");
    setDescription(initial.description || "");
    // Only ever keep a single village image, even if older data has more.
    setImages(initial.images?.length ? [initial.images[0]] : []);

    setPopularEnabled(!!initial.popularPlace);
    setPlaces(
      (initial.popularPlaces || []).slice(0, 5).map((p) => ({
        key: Date.now() + Math.random(),
        name: p.name || "",
        description: p.description || "",
        photos: p.photos?.length ? p.photos.slice(0, 5) : p.photo ? [p.photo] : [],
        videoUrl: p.videoUrl || "",
      }))
    );

    setSmartEnabled(!!initial.smartGaon);
    setStayEnquiry(!!initial.stayEnquiry);
    const a = {};
    (initial.assignments || []).forEach((as) => {
      const devId = as.developmentId ?? as.development?.id;
      if (devId == null) return;
      a[devId] = {
        dev: as.development || { id: devId, title: as.title },
        progressPercent: as.progressPercent ?? 0,
        images: as.images || [],
        videoUrl: as.videoUrl || "",
        document: as.document || "",
      };
    });
    setAssignments(a);
  }, [initial]);

  // ── village images ── (single image only)
  async function onVillageImages(e) {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImages([b64]); // replaces any existing image
    e.target.value = ""; // allow re-selecting the same file to replace again
  }
  function removeImage() {
    setImages([]);
  }

  // ── popular places ──
  function togglePopular(on) {
    setPopularEnabled(on);
    if (on && places.length === 0) setPlaces([makePlace()]);
  }
  function updatePlace(key, patch) {
    setPlaces((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }
  function removePlace(key) {
    setPlaces((prev) => prev.filter((p) => p.key !== key));
  }
  async function onPlacePhotos(key, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const place = places.find((p) => p.key === key);
    const room = 5 - (place?.photos?.length || 0);
    const toAdd = files.slice(0, room);
    const b64s = await filesToBase64(toAdd);
    updatePlace(key, { photos: [...(place?.photos || []), ...b64s] });
    e.target.value = "";
  }
  function removePlacePhoto(key, index) {
    const place = places.find((p) => p.key === key);
    updatePlace(key, { photos: (place?.photos || []).filter((_, i) => i !== index) });
  }

  // ── smart gaon ──
  const phaseNumbers = [...new Set(catalogue.map((d) => d.phaseNumber))].sort(
    (a, b) => a - b
  );
  const phaseDevs = catalogue.filter((d) => d.phaseNumber === activePhase);

  function toggleAssign(dev) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (next[dev.id]) delete next[dev.id];
      else
        next[dev.id] = {
          dev,
          progressPercent: 0,
          images: [],
          videoUrl: "",
          document: "",
        };
      return next;
    });
  }
  function updateAssign(devId, patch) {
    setAssignments((prev) => ({ ...prev, [devId]: { ...prev[devId], ...patch } }));
  }
  async function onAssignImages(devId, e) {
    const b64 = await filesToBase64(e.target.files);
    updateAssign(devId, { images: [...(assignments[devId]?.images || []), ...b64] });
  }
  async function onAssignDoc(devId, e) {
    const file = e.target.files[0];
    if (file) updateAssign(devId, { document: await fileToBase64(file) });
  }

  const selectedCount = Object.keys(assignments).length;
  function phaseSelCount(ph) {
    return Object.values(assignments).filter((a) => a.dev?.phaseNumber === ph)
      .length;
  }

  // ── submit ──
  function buildPayload() {
    return {
      name,
      district,
      state,
      description,
      images,
      popularPlace: popularEnabled,
      popularPlaces: popularEnabled
        ? places.map((p) => ({
            name: p.name,
            description: p.description,
            photos: p.photos,
            videoUrl: p.videoUrl,
          }))
        : [],
      smartGaon: smartEnabled,
      stayEnquiry: smartEnabled ? stayEnquiry : false,
      assignments: smartEnabled
        ? Object.values(assignments).map((a) => ({
            developmentId: a.dev.id,
            progressPercent: Number(a.progressPercent),
            images: a.images,
            videoUrl: a.videoUrl,
            document: a.document,
          }))
        : [],
    };
  }

  function handleSubmit() {
    if (!name.trim()) {
      alert("Village name is required.");
      return;
    }
    onSubmit(buildPayload());
  }

  return (
    <div>
      {/* ── Village details ── */}
      {show("basic") && (
      <div className="sg-card">
        <p className="sg-card-title">Village details</p>

        <div className="sg-field">
          <label>Village name *</label>
          <input
            className="sg-input"
            value={name}
            placeholder="Enter village name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="sg-grid2">
          <div className="sg-field">
            <label>District</label>
            <input
              className="sg-input"
              value={district}
              placeholder="Enter district"
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div className="sg-field">
            <label>State</label>
            <input
              className="sg-input"
              value={state}
              placeholder="Enter state"
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        <div className="sg-field">
          <label>Description</label>
          <textarea
            className="sg-textarea"
            value={description}
            placeholder="Write village details…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="sg-field">
          <label>Village image</label>
          <div className="sg-attach-row">
            {images.length === 0 && (
              <label className="sg-attach-btn">
                📷 Add image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onVillageImages}
                />
              </label>
            )}
          </div>
          {images.length > 0 && (
            <div className="sg-attach-row" style={{ marginTop: 10 }}>
              <div style={{ position: "relative" }}>
                <img className="sg-thumb" src={images[0]} alt="" />
                <button
                  type="button"
                  className="sg-icon-btn"
                  style={{ position: "absolute", top: -6, right: -6, background: "#fff", borderRadius: "50%" }}
                  onClick={removeImage}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
              <label className="sg-attach-btn" style={{ alignSelf: "center" }}>
                🔄 Replace image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onVillageImages}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      )}

      {/* ── Popular places ── */}
      {show("places") && (<>
      <div className="sg-card">
        <div className="sg-toggle-row">
          <div className="sg-toggle-info">
            <h3>Popular places</h3>
            <p>Highlight notable places in this village.</p>
          </div>
          <Toggle checked={popularEnabled} onChange={togglePopular} />
        </div>

        {popularEnabled && (
          <div className="sg-section-body">
            {places.map((p, i) => (
              <div className="sg-place" key={p.key}>
                <div className="sg-place-head">
                  <span>Place {i + 1}</span>
                  <button
                    type="button"
                    className="sg-icon-btn"
                    onClick={() => removePlace(p.key)}
                  >
                    ✕
                  </button>
                </div>
                <div className="sg-field">
                  <label>Place name</label>
                  <input
                    className="sg-input"
                    value={p.name}
                    placeholder="Enter place name"
                    onChange={(e) => updatePlace(p.key, { name: e.target.value })}
                  />
                </div>
                <div className="sg-field">
                  <label>Details</label>
                  <textarea
                    className="sg-textarea"
                    value={p.description}
                    placeholder="Describe this place…"
                    onChange={(e) =>
                      updatePlace(p.key, { description: e.target.value })
                    }
                  />
                </div>
                <div className="sg-grid2">
                  <div className="sg-field">
                    <label>Photos (up to 5)</label>
                    <div className="sg-attach-row">
                      {(p.photos?.length || 0) < 5 && (
                        <label className="sg-attach-btn">
                          📷 Add photo{(p.photos?.length || 0) > 0 ? "s" : ""}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={(e) => onPlacePhotos(p.key, e)}
                          />
                        </label>
                      )}
                    </div>
                    {p.photos?.length > 0 && (
                      <div className="sg-attach-row" style={{ marginTop: 10 }}>
                        {p.photos.map((photo, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <img className="sg-thumb" src={photo} alt="" />
                            <button
                              type="button"
                              className="sg-icon-btn"
                              style={{ position: "absolute", top: -6, right: -6, background: "#fff", borderRadius: "50%" }}
                              onClick={() => removePlacePhoto(p.key, i)}
                              title="Remove photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {p.photos?.length >= 5 && (
                      <p className="sg-note" style={{ marginTop: 6 }}>
                        Maximum 5 photos reached.
                      </p>
                    )}
                  </div>
                  <div className="sg-field">
                    <label>Video link</label>
                    <input
                      className="sg-input"
                      value={p.videoUrl}
                      placeholder="YouTube or video URL"
                      onChange={(e) =>
                        updatePlace(p.key, { videoUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {places.length < 5 ? (
              <button
                type="button"
                className="sg-btn-dashed"
                onClick={() => setPlaces((prev) => [...prev, makePlace()])}
              >
                + Add another place
              </button>
            ) : (
              <p className="sg-note">You can add up to 5 popular places.</p>
            )}
          </div>
        )}
      </div>

      </>)}

      {/* ── Smart Gaon ── */}
      {show("smart") && (<>
      <div className="sg-card">
        <div className="sg-toggle-row">
          <div className="sg-toggle-info">
            <h3>Smart Gaon</h3>
            <p>Turn this on to track phased developments for the village.</p>
          </div>
          <Toggle checked={smartEnabled} onChange={setSmartEnabled} />
        </div>

        {smartEnabled && (
          <div className="sg-section-body">
            {/* Stay Enquiry option */}
            <label className="sg-check-row">
              <input
                type="checkbox"
                checked={stayEnquiry}
                onChange={(e) => setStayEnquiry(e.target.checked)}
              />
              <span>
                <strong>Show Stay Enquiry</strong>
                <span className="sg-check-hint">
                  Let visitors send a stay enquiry on this village's page.
                </span>
              </span>
            </label>

            {selectedCount > 0 && (
              <p className="sg-note" style={{ marginBottom: 12 }}>
                {selectedCount} development{selectedCount !== 1 ? "s" : ""} selected
              </p>
            )}

            {phaseNumbers.length === 0 ? (
              <p className="sg-empty">
                No phases in the catalogue yet. Add developments under the
                “Phases &amp; developments” tab first.
              </p>
            ) : (
              <>
                <div className="sg-pills">
                  {phaseNumbers.map((ph) => (
                    <button
                      type="button"
                      key={ph}
                      className={`sg-pill ${activePhase === ph ? "active" : ""}`}
                      onClick={() =>
                        setActivePhase((cur) => (cur === ph ? null : ph))
                      }
                    >
                      Phase {ph}
                      {phaseSelCount(ph) > 0 ? ` · ${phaseSelCount(ph)}` : ""}
                    </button>
                  ))}
                </div>

                {activePhase !== null && (
                  <div className="sg-dev-grid">
                    {phaseDevs.length === 0 && (
                      <p className="sg-empty">No developments in this phase.</p>
                    )}
                    {phaseDevs.map((dev) => {
                      const sel = assignments[dev.id];
                      const isSel = !!sel;
                      return (
                        <div
                          key={dev.id}
                          className={`sg-dev-card ${isSel ? "selected" : ""}`}
                        >
                          {dev.image ? (
                            <img className="sg-dev-img" src={dev.image} alt="" />
                          ) : (
                            <div className="sg-dev-img-ph">🏗️</div>
                          )}
                          <div className="sg-dev-body">
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleAssign(dev)}
                                style={{ accentColor: "var(--green)" }}
                              />
                              <span className="sg-dev-title" style={{ margin: 0 }}>
                                {dev.title}
                              </span>
                            </label>

                            {isSel && (
                              <div className="sg-progress-box">
                                <div className="sg-progress-head">
                                  <span>Completion</span>
                                  <span>{sel.progressPercent}%</span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={sel.progressPercent}
                                  className="sg-range"
                                  onChange={(e) =>
                                    updateAssign(dev.id, {
                                      progressPercent: Number(e.target.value),
                                    })
                                  }
                                />

                                <div style={{ marginTop: 12 }}>
                                  {/* Images */}
                                  <label className="sg-attach-btn">
                                    📷 Photos
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      style={{ display: "none" }}
                                      onChange={(e) => onAssignImages(dev.id, e)}
                                    />
                                  </label>
                                  {sel.images?.length > 0 && (
                                    <p className="sg-note">
                                      ✓ {sel.images.length} photo(s)
                                    </p>
                                  )}

                                  {/* Video */}
                                  <input
                                    className="sg-input"
                                    style={{ marginTop: 8 }}
                                    placeholder="Video link"
                                    value={sel.videoUrl}
                                    onChange={(e) =>
                                      updateAssign(dev.id, {
                                        videoUrl: e.target.value,
                                      })
                                    }
                                  />

                                  {/* Document */}
                                  <label
                                    className="sg-attach-btn"
                                    style={{ marginTop: 8 }}
                                  >
                                    📄 Document
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      style={{ display: "none" }}
                                      onChange={(e) => onAssignDoc(dev.id, e)}
                                    />
                                  </label>
                                  {sel.document && (
                                    <p className="sg-note">✓ Document attached</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      </>)}

      <div className="sg-actions">
        <button
          className="sg-btn sg-btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
