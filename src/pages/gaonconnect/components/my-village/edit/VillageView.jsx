import { useEffect, useState } from "react";
import { getVillageDevelopments } from "../service/villageDevelopmentService";
import "./villageview.css";

export default function VillageView({ village }) {

  const [developments, setDevelopments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="village-view">

      <h2 className="view-title">{village.name}</h2>

      <div className="view-meta">
        <span><strong>City:</strong> {village.city}</span>
        <span><strong>State:</strong> {village.state}</span>
      </div>

      <p className="view-description">{village.description}</p>

      <hr />

      <h3 className="dev-heading">Development Projects</h3>

      {loading && <p>Loading developments...</p>}

      {!loading && developments.length === 0 && (
        <p>No development assigned yet.</p>
      )}

      {!loading && developments.map((item) => (
        <div key={item.id} className="dev-card">

          <h4>
            Phase {item.development.phaseNumber} - {item.development.title}
          </h4>

          <p className="status">
            {item.progressPercent === 100
              ? "✅ Completed"
              : "🚧 Ongoing"}
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>

          <p className="percent">{item.progressPercent}%</p>

          {item.remarks && (
            <p className="remarks">{item.remarks}</p>
          )}

        </div>
      ))}

    </div>
  );
}