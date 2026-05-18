import { useEffect, useState } from "react";
import { getProjectById } from "../service/developmentservice";
import {
  getDevelopmentImages,
  getDevelopmentVideo,
  getDevelopmentReports
} from "../service/villageDevelopmentService";
import "./projectdetail.css";

/* ── helpers ── */
function getFileType(url = "") {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".pdf"))  return "pdf";
  if (u.endsWith(".doc") || u.endsWith(".docx")) return "word";
  if (u.endsWith(".xls") || u.endsWith(".xlsx")) return "excel";
  return "other";
}

function getFileIcon(type) {
  if (type === "pdf")   return "📕";
  if (type === "word")  return "📘";
  if (type === "excel") return "📗";
  return "📄";
}

function getFileName(url = "", index) {
  const parts = url.split("/");
  const raw = parts[parts.length - 1].split("?")[0];
  return raw || `Document ${index + 1}`;
}

function isYouTube(url = "") {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYtId(url = "") {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : "";
}

function getYtEmbed(url) {
  const id = getYtId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
}

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }) {
  const [cur, setCur] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") setCur(c => Math.min(c + 1, images.length - 1));
      if (e.key === "ArrowLeft")  setCur(c => Math.max(c - 1, 0));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-box" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>

        <button
          className="lb-arrow lb-left"
          disabled={cur === 0}
          onClick={() => setCur(c => c - 1)}
        >‹</button>

        <img src={images[cur]} alt="gallery" className="lb-img" />

        <button
          className="lb-arrow lb-right"
          disabled={cur === images.length - 1}
          onClick={() => setCur(c => c + 1)}
        >›</button>

        <div className="lb-counter">{cur + 1} / {images.length}</div>
      </div>
    </div>
  );
}

/* ── Video Player ── */
function VideoPlayer({ url, onClose }) {
  const yt = isYouTube(url);
  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="vp-box" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>
        {yt ? (
          <iframe
            src={getYtEmbed(url)}
            className="vp-frame"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="video"
          />
        ) : (
          <video src={url} controls autoPlay className="vp-frame" />
        )}
      </div>
    </div>
  );
}

/* ── PDF Viewer ── */
function PdfViewer({ url, onClose }) {
  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="pdf-box" onClick={e => e.stopPropagation()}>
        <div className="pdf-header">
          <span>📕 PDF Viewer</span>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={url} target="_blank" rel="noreferrer" className="pdf-open-btn">
              Open in Tab ↗
            </a>
            <button className="lb-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <iframe src={url} className="pdf-frame" title="pdf" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function ProjectDetail({ project, onBack }) {

  const [data,    setData]    = useState(null);
  const [images,  setImages]  = useState([]);
  const [videos,  setVideos]  = useState([]);   // array
  const [reports, setReports] = useState([]);

  /* Lightbox */
  const [lbIndex, setLbIndex] = useState(null);

  /* Video player */
  const [activeVideo, setActiveVideo] = useState(null);

  /* PDF viewer */
  const [activePdf, setActivePdf] = useState(null);

  useEffect(() => {
    loadProject();
    loadMedia();
  }, []);

  const loadProject = async () => {
    try {
      const res = await getProjectById(project.development.id);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const loadMedia = async () => {
    try {
      const img = await getDevelopmentImages(project.id);
      const vid = await getDevelopmentVideo(project.id);
      const rep = await getDevelopmentReports(project.id);

      setImages(img || []);
      // vid can be string or array
      if (Array.isArray(vid)) setVideos(vid);
      else if (vid) setVideos([vid]);
      else setVideos([]);

      setReports(rep || []);
    } catch (err) { console.error(err); }
  };

  if (!data) {
    return <p style={{ padding: "20px", color: "#94a3b8" }}>⏳ Loading project...</p>;
  }

  const pct = project.progressPercent ?? 0;
  const isDone = pct >= 100;
  const statusClass = isDone ? "pill-done" : data.status === "UPCOMING" ? "pill-upcoming" : "pill-ongoing";
  const statusLabel = isDone ? "✅ Completed" : data.status === "UPCOMING" ? "📅 Upcoming" : "🔄 Ongoing";

  const hasMedia = images.length > 0 || videos.length > 0 || reports.length > 0;

  return (
    <div className="project-page">

      {/* Back */}
      <button className="back-btn" onClick={onBack}>← Back</button>

      {/* Hero */}
      {data.master?.imageUrl ? (
        <div className="pd-hero">
          <img src={data.master.imageUrl} alt="project" className="pd-hero-img" />
          <div className="pd-hero-overlay">
            <div className="pd-hero-text">
              <h1>{data.master?.title}</h1>
              <span className="pd-phase-tag">Phase {data.phaseNumber}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pd-no-img-header">
          <h1>{data.master?.title}</h1>
          <span className="pd-phase-tag">Phase {data.phaseNumber}</span>
        </div>
      )}

      {/* Meta Grid */}
      <div className="pd-meta-grid">
        <div className="pd-meta-item">
          <div className="pd-meta-label">Status</div>
          <span className={`pd-status-pill ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="pd-meta-item">
          <div className="pd-meta-label">Progress</div>
          <div className="pd-meta-value">{pct}%</div>
        </div>
        <div className="pd-meta-item">
          <div className="pd-meta-label">Start Date</div>
          <div className="pd-meta-value">{data.startDate || "—"}</div>
        </div>
        <div className="pd-meta-item">
          <div className="pd-meta-label">End Date</div>
          <div className="pd-meta-value">{data.endDate || "—"}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pd-progress-section">
        <div className="pd-progress-header">
          <span className="pd-progress-label">Completion Progress</span>
          <span className="pd-progress-pct">{pct}%</span>
        </div>
        <div className="pd-bar">
          <div className="pd-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Description */}
      {data.description && <div className="pd-desc">{data.description}</div>}

      {/* ══ MEDIA & DOCUMENTS ══ */}
      {hasMedia && <h2 className="section-title">Media & Documents</h2>}

      {/* ── IMAGES ── horizontal scroll + lightbox */}
      {images.length > 0 && (
        <div className="media-section">
          <h3 className="sub-title">🖼️ Gallery ({images.length})</h3>
          <div className="img-scroll-strip">
            {images.map((img, i) => (
              <div
                key={i}
                className="img-scroll-item"
                onClick={() => setLbIndex(i)}
              >
                <img src={img} alt={`img-${i}`} />
                <div className="img-zoom-hint">🔍</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIDEOS ── horizontal scroll + in-app player */}
      {videos.length > 0 && (
        <div className="media-section">
          <h3 className="sub-title">🎬 Videos ({videos.length})</h3>
          <div className="video-scroll-strip">
            {videos.map((url, i) => {
              const yt = isYouTube(url);
              const ytId = yt ? getYtId(url) : null;
              return (
                <div
                  key={i}
                  className="video-card"
                  onClick={() => setActiveVideo(url)}
                >
                  {yt && ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                      alt="yt-thumb"
                      className="video-card-thumb"
                    />
                  ) : (
                    <div className="video-card-placeholder">🎥</div>
                  )}
                  <div className="video-card-play">▶</div>
                  <div className="video-card-label">
                    {yt ? "YouTube" : `Video ${i + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ── PDF viewer / Word / Excel cards */}
      {reports.length > 0 && (
        <div className="media-section">
          <h3 className="sub-title">📁 Documents ({reports.length})</h3>
          <div className="docs-grid">
            {reports.map((url, i) => {
              const type = getFileType(url);
              const icon = getFileIcon(type);
              const name = getFileName(url, i);
              return (
                <div key={i} className={`doc-card doc-${type}`}>
                  <div className="doc-icon">{icon}</div>
                  <div className="doc-info">
                    <div className="doc-name" title={name}>{name}</div>
                    <div className="doc-type">{type.toUpperCase()}</div>
                  </div>
                  <div className="doc-actions">
                    {type === "pdf" ? (
                      <button
                        className="doc-btn doc-view-btn"
                        onClick={() => setActivePdf(url)}
                      >
                        View
                      </button>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-btn doc-download-btn"
                      >
                        Open ↗
                      </a>
                    )}
                    <a
                      href={url}
                      download
                      className="doc-btn doc-dl-btn"
                    >
                      ⬇
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ OVERLAYS ══ */}
      {lbIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}

      {activeVideo && (
        <VideoPlayer url={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {activePdf && (
        <PdfViewer url={activePdf} onClose={() => setActivePdf(null)} />
      )}

    </div>
  );
}
