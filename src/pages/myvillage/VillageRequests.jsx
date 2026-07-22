import { useEffect, useState } from "react";
import {
  getVillageRequests,
  getVillageRequestById,
  approveVillageRequest,
  rejectVillageRequest,
  deleteVillageRequest,
  fileUrl,
} from "./services/villageRequestService";
import { Toast } from "./ui";
import "./admin.css";

function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function Lightbox({ items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = items.length > 1;
  const current = items[index];

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasMultiple) next();
      if (e.key === "ArrowLeft" && hasMultiple) prev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!current) return null;

  function next() {
    setIndex((i) => (i + 1) % items.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  const embedUrl = current.type === "video" ? toEmbedUrl(current.src) : null;

  return (
    <div
      className="sg-lightbox-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Cancel button */}
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

      {/* Caption */}
      {current.title && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 24,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            maxWidth: "60%",
          }}
        >
          {current.title}
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "90vw",
          height: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple && (
          <button
            onClick={prev}
            aria-label="Previous"
            style={{
              position: "absolute",
              left: 4,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: 26,
              width: 46,
              height: 46,
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            ‹
          </button>
        )}

        {current.type === "video" ? (
          embedUrl ? (
            <iframe
              src={embedUrl}
              title={current.title || "video"}
              style={{
                width: "min(80vw, 960px)",
                height: "60vh",
                border: "none",
                borderRadius: 8,
              }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={current.src}
              controls
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }}
            />
          )
        ) : (
          <img
            src={current.src}
            alt={current.title || ""}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        )}

        {hasMultiple && (
          <button
            onClick={next}
            aria-label="Next"
            style={{
              position: "absolute",
              right: 4,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: 26,
              width: 46,
              height: 46,
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            ›
          </button>
        )}
      </div>

      {hasMultiple && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            color: "#fff",
            fontSize: 13,
            opacity: 0.85,
          }}
        >
          {index + 1} / {items.length}
        </div>
      )}
    </div>
  );
}

function ReviewModal({ request, onClose, onDone }) {
  const hasPlaces = request.places?.length > 0;
  const isPending = request.status === "PENDING";

  const sections = [["basic", "👤", "Basic information"]];
  if (hasPlaces) sections.push(["places", "📍", "Popular places"]);
  sections.push(["submitter", "📞", "Submitted by"]);

  const [section, setSection] = useState("basic");
  const [working, setWorking] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [lightbox, setLightbox] = useState(null); // { items, index }

  async function handleApprove() {
    if (!window.confirm(`Approve "${request.name}"? A village will be created and shown on the public page.`)) return;
    setWorking(true);
    try {
      await approveVillageRequest(request.id);
      onDone("Request approved — village created.");
      onClose();
    } catch (e) {
      console.error(e);
      onDone(e.response?.data?.message || "Could not approve request.");
    } finally {
      setWorking(false);
    }
  }

  async function handleReject() {
    setWorking(true);
    try {
      await rejectVillageRequest(request.id, reason.trim());
      onDone("Request rejected.");
      onClose();
    } catch (e) {
      console.error(e);
      onDone(e.response?.data?.message || "Could not reject request.");
    } finally {
      setWorking(false);
    }
  }

  // Precompute the gallery of place photos once so clicking any place
  // photo opens a lightbox that can page through ALL of them.
  const placePhotoItems = (request.places || [])
    .filter((p) => p.photo)
    .map((p) => ({ type: "image", src: fileUrl(p.photo), title: p.name }));

  return (
    <>
      <div className="sg-overlay" onClick={onClose}>
        <div className="sg-modal sg-modal-wide" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sg-modal-head">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="sg-avatar">{request.name?.charAt(0)}</div>
              <div>
                <h2 style={{ margin: 0 }}>{request.name}</h2>
                <div className="sg-vmeta" style={{ marginTop: 2 }}>
                  <span>📍 {request.district}</span>
                  <span>🗺️ {request.state}</span>
                  <span className={`sg-badge sg-badge-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            </div>
            <button className="sg-close" onClick={onClose}>✕</button>
          </div>

          {/* Two-panel body */}
          <div className="sg-edit-split">
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

            <div className="sg-edit-content">
              {/* BASIC */}
              {section === "basic" && (
                <div>
                  {request.images?.length > 0 ? (
                    <div className="sg-view-strip" style={{ marginBottom: 18 }}>
                      {request.images.map((img, i) => (
                        <img
                          key={i}
                          src={fileUrl(img)}
                          alt=""
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setLightbox({
                              items: request.images.map((im) => ({
                                type: "image",
                                src: fileUrl(im),
                              })),
                              index: i,
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="sg-empty">No village images submitted.</p>
                  )}
                  <h3 className="sg-view-h" style={{ marginTop: 0 }}>About</h3>
                  {request.description ? (
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{request.description}</p>
                  ) : (
                    <p className="sg-empty">No description added.</p>
                  )}
                  {request.status === "REJECTED" && request.rejectionReason && (
                    <p className="sg-note" style={{ marginTop: 16 }}>
                      Rejection reason: {request.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              {/* PLACES */}
              {section === "places" && (
                <div>
                  <h3 className="sg-view-h" style={{ marginTop: 0 }}>Popular places</h3>
                  <div className="sg-dev-grid">
                    {request.places.map((p, i) => (
                      <div className="sg-dev-card" key={i}>
                        {p.photo ? (
                          <img
                            className="sg-dev-img"
                            src={fileUrl(p.photo)}
                            alt=""
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setLightbox({
                                items: placePhotoItems,
                                index: placePhotoItems.findIndex(
                                  (it) => it.src === fileUrl(p.photo)
                                ),
                              })
                            }
                          />
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
                                setLightbox({
                                  items: [{ type: "video", src: p.videoUrl, title: p.name }],
                                  index: 0,
                                })
                              }
                              style={{
                                fontSize: 13,
                                color: "var(--green)",
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                marginTop: 4,
                              }}
                            >
                              ▶ Watch video
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBMITTER */}
              {section === "submitter" && (
                <div>
                  <h3 className="sg-view-h" style={{ marginTop: 0 }}>Submitted by</h3>
                  <p style={{ margin: "0 0 6px" }}>
                    <strong>Name:</strong> {request.submitterName || "—"}
                  </p>
                  <p style={{ margin: "0 0 6px" }}>
                    <strong>Phone:</strong> {request.submitterPhone || "—"}
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                    Submitted on {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer — approve / reject */}
          <div className="sg-modal-foot" style={{ flexWrap: "wrap", gap: 10 }}>
            {isPending && rejecting ? (
              <>
                <input
                  className="sg-input"
                  style={{ flex: 1, minWidth: 200 }}
                  placeholder="Reason for rejection (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                />
                <button className="sg-btn sg-btn-ghost" onClick={() => setRejecting(false)} disabled={working}>
                  Back
                </button>
                <button className="sg-btn sg-btn-danger" onClick={handleReject} disabled={working}>
                  {working ? "Rejecting…" : "Confirm reject"}
                </button>
              </>
            ) : (
              <>
                <button className="sg-btn sg-btn-ghost" onClick={onClose}>Close</button>
                {isPending && (
                  <>
                    <button className="sg-btn sg-btn-danger" onClick={() => setRejecting(true)} disabled={working}>
                      Reject
                    </button>
                    <button className="sg-btn sg-btn-primary" onClick={handleApprove} disabled={working}>
                      {working ? "Approving…" : "Approve & create village"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          items={lightbox.items}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function VillageRequests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("pending"); // pending | approved | rejected | all
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function load() {
    setLoading(true);
    try {
      const res = await getVillageRequests(status);
      setRequests(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openReview(r) {
    try {
      const res = await getVillageRequestById(r.id);
      setReviewing(res.data);
    } catch (e) {
      setReviewing(r);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this request? Its uploaded files will also be removed.")) return;
    try {
      await deleteVillageRequest(id);
      setToast("Request deleted.");
      load();
    } catch (e) {
      console.error(e);
      setToast("Could not delete.");
    }
  }

  return (
    <div className="sg-page">
      <h1 className="sg-page-title">Village requests</h1>
      <p className="sg-page-sub">
        Villages submitted by visitors on the public website. Review the
        details, images, and videos — approve to publish the village, or
        reject the request.
      </p>

      <div className="sg-pills" style={{ marginBottom: 20 }}>
        {[
          ["pending", "Pending"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["all", "All"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`sg-pill ${status === id ? "active" : ""}`}
            onClick={() => setStatus(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="sg-empty">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="sg-card">
          <p className="sg-empty">
            {status === "pending"
              ? "No pending requests — you're all caught up."
              : "No requests here."}
          </p>
        </div>
      ) : (
        <div className="sg-vlist">
          {requests.map((r) => (
            <div className="sg-vrow" key={r.id}>
              <div className="sg-vleft">
                <div className="sg-avatar">{r.name?.charAt(0)}</div>
                <div>
                  <div className="sg-vname-row">
                    <span className="sg-vname">{r.name}</span>
                    <span className={`sg-badge sg-badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="sg-vmeta">
                    <span>📍 {r.district}</span>
                    <span>🗺️ {r.state}</span>
                    <span>🕒 {new Date(r.createdAt).toLocaleDateString()}</span>
                    {r.images?.length > 0 && <span>📷 {r.images.length}</span>}
                    {r.places?.length > 0 && <span>📌 {r.places.length} place(s)</span>}
                  </div>
                </div>
              </div>
              <div className="sg-vactions">
                <button className="sg-btn sg-btn-ghost sg-btn-sm" onClick={() => openReview(r)}>
                  {r.status === "PENDING" ? "Review" : "View"}
                </button>
                <button className="sg-btn sg-btn-danger sg-btn-sm" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewModal
          request={reviewing}
          onClose={() => setReviewing(null)}
          onDone={(msg) => {
            setToast(msg);
            load();
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
