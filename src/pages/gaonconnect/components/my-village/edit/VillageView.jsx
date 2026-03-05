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
  ...new Set(
    developments.map((d) => d.development.phaseNumber)
  )
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

{images.length > 0 && (
  <div className="image-scroll">
    {images.map((img, index) => (
      <img
        key={index}
        src={img}
        alt="village"
        className="scroll-img"
      />
    ))}
  </div>
)}

      <h2 className="view-title">{village.name}</h2>

      <div className="view-meta">
        <span><strong>City:</strong> {village.city}</span>
        <span><strong>State:</strong> {village.state}</span>
      </div>

      <p className="view-description">{village.description}</p>

      <hr />

      <h3 className="dev-heading">Development Projects</h3>
        
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

      {loading && <p>Loading developments...</p>}


    

    {!loading && developments.map((item) => {

  const dev = item.development;



  return (
    <div key={item.id} className="dev-card" onClick={() => setSelectedProject(item)}>

      {/* Title + Phase */}
      <h4 className="dev-title">
        Phase {dev.phaseNumber} - {dev.master?.title || "Development"}
      </h4>

      {/* Master Image */}
      {dev.master?.imageUrl && (
        <img
          src={dev.master.imageUrl}
          alt="development"
          className="dev-main-image"
        />
      )}

      {/* Status */}
      <p className="status">
        {item.progressPercent === 100
          ? "✅ Completed"
          : "🚧 Ongoing"}
      </p>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${item.progressPercent}%` }}
        />
      </div>

      <p className="percent">{item.progressPercent}%</p>

      {/* Remarks */}
      {item.remarks && (
        <p className="remarks">{item.remarks}</p>
      )}

      {/* Progress Images */}
      {item.images && item.images.length > 0 && (
        <div className="progress-images">
          {item.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="progress"
              className="progress-img"
            />
          ))}
        </div>
      )}

    </div>
  );
})}

    </div>
  );
}