import { useEffect, useState } from "react";
import {
  getAllVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
} from "./services/villageService";
import VillageForm from "./VillageForm";
import StayEnquiry from "./stay-enquiry/StayEnquiry";
import { Toast } from "./ui";
import "./admin.css";

/* ══════════════════════════════════════════════
   LIGHTBOX — shared image/video dialog with
   close button + prev/next when multiple items
══════════════════════════════════════════════ */
function isEmbeddableVideo(url = "") {
  return /youtube\.com|youtu\.be|facebook\.com/.test(url);
}

function toEmbedUrl(url = "") {
  const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  if (url.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
  }
  return url;
}

function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  if (!items || items.length === 0) return null;
  const item = items[index];
  const hasMultiple = items.length > 1;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Cancel / close button */}
        <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 18,
          right: 22,
          background: "rgba(255,255,255,0.12)",
          border: "none",
          color: "#fff",
          fontSize: 22,
          width: 40,
          height: 40,
          borderRadius: "50%",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

        {/* Prev */}
        {hasMultiple && (
          <button
            onClick={() => onNav(-1)}
            style={{
              position: "absolute",
              left: -56,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#ffffff",
              color: "#111111",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ‹
          </button>
        )}

        {/* Content */}
        {item.type === "video" ? (
          isEmbeddableVideo(item.src) ? (
            <iframe
              src={toEmbedUrl(item.src)}
              title="video"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{
                width: "80vw",
                maxWidth: 900,
                height: "45vw",
                maxHeight: 500,
                border: "none",
                borderRadius: 8,
                background: "#000",
              }}
            />
          ) : (
            <video
              src={item.src}
              controls
              autoPlay
              style={{
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: 8,
                background: "#000",
              }}
            />
          )
        ) : (
          <img
            src={item.src}
            alt=""
            style={{
              maxWidth: "80vw",
              maxHeight: "80vh",
              borderRadius: 8,
              objectFit: "contain",
            }}
          />
        )}

        {/* Next */}
        {hasMultiple && (
          <button
            onClick={() => onNav(1)}
            style={{
              position: "absolute",
              right: -56,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#ffffff",
              color: "#111111",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ›
          </button>
        )}

        {/* Counter */}
        {hasMultiple && (
          <div
            style={{
              position: "absolute",
              bottom: -32,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              fontSize: 13,
            }}
          >
            {index + 1} / {items.length}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VIEW MODAL — two-panel read-only (matches Edit)
══════════════════════════════════════════════ */
function ViewModal({ village, onClose }) {
  const hasPlaces = village.popularPlace && village.popularPlaces?.length > 0;
  const isSmart = !!village.smartGaon;

  // Build the sidebar sections that actually apply to this village
  const sections = [["basic", "👤", "Basic information"]];
  if (hasPlaces) sections.push(["places", "📍", "Popular places"]);
  if (isSmart) sections.push(["smart", "📊", "Smart Gaon"]);
  if (isSmart && village.stayEnquiry) sections.push(["stay", "🏠", "Stay Enquiry"]);

  const [section, setSection] = useState("basic");
  const [lightbox, setLightbox] = useState(null); // { items: [{type,src}], index }

  function openLightbox(items, index = 0) {
    if (!items || items.length === 0) return;
    setLightbox({ items, index });
  }
  function navLightbox(delta) {
    setLightbox((prev) => {
      if (!prev) return prev;
      const len = prev.items.length;
      const next = (prev.index + delta + len) % len;
      return { ...prev, index: next };
    });
  }

  return (
    <div className="sg-overlay" onClick={onClose}>
      <div className="sg-modal sg-modal-wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sg-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="sg-avatar">{village.name?.charAt(0)}</div>
            <div>
              <h2 style={{ margin: 0 }}>{village.name}</h2>
              <div className="sg-vmeta" style={{ marginTop: 2 }}>
                <span>📍 {village.district || village.city}</span>
                <span>🗺️ {village.state}</span>
                {isSmart && <span>⭐ Smart Gaon</span>}
              </div>
            </div>
          </div>
          <button className="sg-close" onClick={onClose}>✕</button>
        </div>

        {/* Two-panel body */}
        <div className="sg-edit-split">
          {/* Sidebar */}
          <aside className="sg-edit-nav">
            <p className="sg-edit-nav-label">Sections</p>
            {sections.map(([id, icon, label]) => (
              <button
                key={id}
                className={`sg-side-item ${section === id ? "active" : ""}`}
                onClick={() => setSection(id)}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="sg-edit-content">
            {/* BASIC */}
            {section === "basic" && (
              <div>
                {village.images?.length > 0 && (
                  <div className="sg-view-strip" style={{ marginBottom: 18 }}>
                    {village.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          openLightbox(
                            village.images.map((src) => ({ type: "image", src })),
                            i
                          )
                        }
                      />
                    ))}
                  </div>
                )}
                <h3 className="sg-view-h" style={{ marginTop: 0 }}>About</h3>
                {village.description ? (
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{village.description}</p>
                ) : (
                  <p className="sg-empty">No description added.</p>
                )}
              </div>
            )}

            {/* POPULAR PLACES */}
            {section === "places" && (
              <div>
                <h3 className="sg-view-h" style={{ marginTop: 0 }}>Popular places</h3>
                <div className="sg-dev-grid">
                  {village.popularPlaces.map((p, i) => {
                    // Support either a `photos` array (multiple images)
                    // or a single `photo` field, whichever the record has.
                    const photos = Array.isArray(p.photos) && p.photos.length > 0
                      ? p.photos
                      : p.photo
                      ? [p.photo]
                      : [];
                    const photoItems = photos.map((src) => ({ type: "image", src }));

                    return (
                      <div className="sg-dev-card" key={i}>
                        {photos.length > 0 ? (
                          <div style={{ position: "relative" }}>
                            <img
                              className="sg-dev-img"
                              src={photos[0]}
                              alt=""
                              style={{ cursor: "pointer" }}
                              onClick={() => openLightbox(photoItems, 0)}
                            />
                            {photos.length > 1 && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: 6,
                                  right: 6,
                                  background: "rgba(0,0,0,0.65)",
                                  color: "#fff",
                                  fontSize: 11,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                +{photos.length - 1} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="sg-dev-img-ph">📍</div>
                        )}
                        <div className="sg-dev-body">
                          <p className="sg-dev-title">{p.name}</p>
                          {p.description && (
                            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
                              {p.description}
                            </p>
                          )}
                          {p.videoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                openLightbox([{ type: "video", src: p.videoUrl }], 0)
                              }
                              style={{
                                fontSize: 13,
                                color: "var(--green)",
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                              }}
                            >
                              ▶ Watch video
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SMART GAON */}
            {section === "smart" && (
              (() => {
                const assigns = village.assignments || [];
                if (assigns.length === 0) {
                  return (
                    <div>
                      <h3 className="sg-view-h" style={{ marginTop: 0 }}>Development progress</h3>
                      <p className="sg-empty">No developments assigned yet.</p>
                    </div>
                  );
                }
                // Group assignments by phase number
                const byPhase = {};
                assigns.forEach((a) => {
                  const ph = a.development?.phaseNumber ?? "—";
                  (byPhase[ph] ||= []).push(a);
                });
                const phaseKeys = Object.keys(byPhase).sort((x, y) => Number(x) - Number(y));

                // Overall average completion
                const overall = Math.round(
                  assigns.reduce((s, a) => s + (a.progressPercent ?? 0), 0) / assigns.length
                );

                return (
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
                      <h3 className="sg-view-h" style={{ margin: 0 }}>Development progress</h3>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>
                        {overall}% overall · {assigns.length} development{assigns.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {phaseKeys.map((ph) => {
                      const items = byPhase[ph];
                      const phaseAvg = Math.round(
                        items.reduce((s, a) => s + (a.progressPercent ?? 0), 0) / items.length
                      );
                      return (
                        <div key={ph} className="sg-phase-group">
                          <div className="sg-phase-group-head">
                            <span className="sg-phase-tag">Phase {ph}</span>
                            <span className="sg-phase-avg">{phaseAvg}% avg</span>
                          </div>
                          {items.map((a, i) => {
                            const dev = a.development || {};
                            const pct = a.progressPercent ?? 0;
                            return (
                              <div key={i} style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                                  <span>{dev.title || `Development #${a.developmentId}`}</span>
                                  <strong>{pct}%</strong>
                                </div>
                                <div className="sg-bar">
                                  <div className="sg-bar-fill" style={{ width: `${pct}%` }} />
                                </div>
                                {a.videoUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openLightbox([{ type: "video", src: a.videoUrl }], 0)
                                    }
                                    style={{
                                      fontSize: 12,
                                      color: "var(--green)",
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ▶ Video
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}

            {section === "stay" && (
              <div>
                <h3 className="sg-view-h" style={{ marginTop: 0 }}>Stay Enquiry</h3>
                <div className="sg-stay-status">
                  <span className="sg-stay-badge">🏠 Stay Enquiry enabled</span>
                  <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                    Visitors can send a stay enquiry on this village's page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sg-modal-foot">
          <button className="sg-btn sg-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={navLightbox}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   EDIT MODAL — two-panel with sidebar tabs
══════════════════════════════════════════════ */
const EDIT_SECTIONS = [
  ["basic", "👤", "Basic information"],
  ["places", "📍", "Popular places"],
  ["smart", "📊", "Smart Gaon"],
];

function EditModal({ village, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [section, setSection] = useState("basic");

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await updateVillage(village.id, payload);
      onSaved("Village updated.");
      onClose();
    } catch (e) {
      console.error(e);
      onSaved("Could not update village.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sg-overlay" onClick={onClose}>
      <div className="sg-modal sg-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="sg-modal-head">
          <h2>Edit village</h2>
          <button className="sg-close" onClick={onClose}>✕</button>
        </div>

        <div className="sg-edit-split">
          {/* Left sidebar */}
          <aside className="sg-edit-nav">
            <p className="sg-edit-nav-label">Sections</p>
            {EDIT_SECTIONS.map(([id, icon, label]) => (
              <button
                key={id}
                className={`sg-side-item ${section === id ? "active" : ""}`}
                onClick={() => setSection(id)}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </aside>

          {/* Right content — renders only the active section */}
          <div className="sg-edit-content">
            <VillageForm
              initial={village}
              submitLabel="Save changes"
              submitting={submitting}
              onSubmit={handleSubmit}
              activeSection={section}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function VillageList({ onCreate }) {
  const [villages, setVillages] = useState([]);
  const [tab, setTab] = useState("all"); // all | smart | normal | stay
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getAllVillages();
      setVillages(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openView(v) {
    try {
      const res = await getVillageById(v.id);
      setViewing(res.data);
    } catch (e) {
      setViewing(v);
    }
  }

  async function openEdit(v) {
    try {
      const res = await getVillageById(v.id);
      setEditing(res.data);
    } catch (e) {
      setEditing(v);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this village?")) return;
    try {
      await deleteVillage(id);
      setToast("Village deleted.");
      load();
    } catch (e) {
      console.error(e);
      setToast("Could not delete.");
    }
  }

  const filtered = villages.filter((v) =>
    tab === "smart" ? v.smartGaon : tab === "normal" ? !v.smartGaon : true
  );

  return (
    <div className="sg-page">
      <h1 className="sg-page-title">Villages</h1>
      <p className="sg-page-sub">
        View any village, or edit its details, popular places, and Smart Gaon
        developments.
      </p>

      {onCreate && tab !== "stay" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="sg-btn sg-btn-primary" onClick={onCreate}>
            + Create village
          </button>
        </div>
      )}

      <div className="sg-pills" style={{ marginBottom: 20 }}>
        {[
          ["all", "All"],
          ["smart", "Smart Gaon"],
          ["normal", "Villages"],
          ["stay", "Stay Enquiry"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`sg-pill ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "stay" ? (
        <StayEnquiry />
      ) : loading ? (
        <p className="sg-empty">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="sg-card">
          <p className="sg-empty">No villages here yet.</p>
        </div>
      ) : (
        <div className="sg-vlist">
          {filtered.map((v) => (
            <div className="sg-vrow" key={v.id}>
              <div className="sg-vleft">
                <div className="sg-avatar">{v.name?.charAt(0)}</div>
                <div>
                  <div className="sg-vname-row">
                    <span className="sg-vname">{v.name}</span>
                    <span className={`sg-badge ${v.smartGaon ? "sg-badge-smart" : "sg-badge-normal"}`}>
                      {v.smartGaon ? "SMART" : "STANDARD"}
                    </span>
                  </div>
                  <div className="sg-vmeta">
                    <span>📍 {v.district || v.city}</span>
                    <span>🗺️ {v.state}</span>
                  </div>
                </div>
              </div>
              <div className="sg-vactions">
                <button className="sg-btn sg-btn-ghost sg-btn-sm" onClick={() => openView(v)}>View</button>
                <button className="sg-btn sg-btn-ghost sg-btn-sm" onClick={() => openEdit(v)}>Edit</button>
                <button className="sg-btn sg-btn-danger sg-btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && <ViewModal village={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <EditModal
          village={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setToast(msg);
            load();
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}