import { useEffect, useState } from "react";
import { getVillageDevelopments } from "../service/villageDevelopmentService";
import "./villageview.css";
import ProjectDetail from "./ProjectDetail";

export default function VillageView({ village }) {

  const [developments, setDevelopments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(1);
  const images = village.images || [];
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadDevelopments();
  }, [village.id]);

  const loadDevelopments = async () => {
    try {
      const data = await getVillageDevelopments(village.id);
      setDevelopments(data?.data ?? data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const availablePhases = [
    ...new Set(developments.map((d) => d.development.phaseNumber))
  ].sort((a, b) => a - b);

  useEffect(() => {
    if (availablePhases.length > 0) {
      setPhase(availablePhases[0]);
    }
  }, [developments]);

  const phaseProjects = developments.filter(
    (d) => d.development.phaseNumber === phase
  );

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="village-view">

      {/* ── Header Card ── */}
      <div className="vv-header">
        <div className="vv-avatar">
          {village.name?.charAt(0) || "V"}
        </div>
        <div className="vv-header-info">
          <h2 className="vv-village-name">{village.name}</h2>
          <div className="vv-meta-pills">
            <span className="vv-pill">📍 {village.city}</span>
            <span className="vv-pill">🗺️ {village.state}</span>
            {village.smartGaon && (
              <span className="vv-pill">⭐ Smart Village</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Image Strip ── */}
      {images.length > 0 && (
        <div className="vv-image-strip">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="village"
              className="vv-strip-img"
            />
          ))}
        </div>
      )}

      {/* ── Description ── */}
      {village.description && (
        <div className="vv-desc">{village.description}</div>
      )}

      {/* ── Development Section ── */}
      <div className="vv-section-head">
        <h3>Development Projects</h3>
      </div>

      {/* Phase Tabs */}
      {availablePhases.length > 0 && (
        <div className="phase-tabs">
          {availablePhases.map((p) => (
            <button
              key={p}
              className={`phase-tab ${phase === p ? "active" : ""}`}
              onClick={() => setPhase(p)}
            >
              Phase {p}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="vv-loading">⏳ Loading developments...</div>}

      {/* Dev Cards */}
      {!loading && phaseProjects.length === 0 && (
        <div className="vv-empty">🏗️ No projects in this phase yet.</div>
      )}

      {!loading && phaseProjects.map((item) => {
        const dev = item.development;
        const pct = item.progressPercent ?? 0;
        const isDone = pct >= 100;

        return (
          <div
            key={item.id}
            className="dev-card"
            onClick={() => setSelectedProject(item)}
          >
            {/* Thumbnail */}
            {dev.master?.imageUrl
              ? <img src={dev.master.imageUrl} alt="dev" className="dev-thumb" />
              : <div className="dev-thumb-placeholder">🏗️</div>
            }

            {/* Body */}
            <div className="dev-card-body">
              <p className="dev-card-title">
                {dev.master?.title || "Development Project"}
              </p>
              <span className="dev-card-phase">Phase {dev.phaseNumber}</span>

              <div className="dev-progress-wrap">
                <div className="dev-bar">
                  <div className="dev-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="dev-percent">{pct}%</span>
              </div>

              {item.remarks && (
                <p className="dev-remarks">💬 {item.remarks}</p>
              )}
            </div>

            {/* Status Badge */}
            <span className={`dev-status-badge ${isDone ? "badge-done" : "badge-ongoing"}`}>
              {isDone ? "✅ Done" : "🔄 Ongoing"}
            </span>
          </div>
        );
      })}

    </div>
  );
}
