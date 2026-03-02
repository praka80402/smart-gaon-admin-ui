import { useEffect, useState } from "react";
import {
  getAllDevelopment,
  getByPhase,
  deleteDevelopment,updateDevelopment
} from "../service/developmentservice";
import "./development.css";

export default function DevelopmentList() {

  const [projects, setProjects] = useState([]);
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [phaseFilter]);

  const fetchProjects = async () => {
    try {
      let res;

      if (phaseFilter === "all") {
        res = await getAllDevelopment();
      } else {
        res = await getByPhase(phaseFilter);
      }

      setProjects(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      await deleteDevelopment(id);
      fetchProjects();
    }
  };

  const handleUpdate = async () => {
  try {
    const formData = new FormData();
    formData.append("phaseNumber", editProject.phaseNumber);
    formData.append("title", editProject.title);
    formData.append("description", editProject.description);
    formData.append("status", editProject.status);

    await updateDevelopment(editProject.id, formData);

    setEditProject(null);
    fetchProjects();

  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="dev-container">

      <h2>Development Project List</h2>

      <select
        value={phaseFilter}
        onChange={(e) => setPhaseFilter(e.target.value)}
      >
        <option value="all">All Phases</option>
        <option value="1">Phase 1</option>
        <option value="2">Phase 2</option>
        <option value="3">Phase 3</option>
      </select>

      <div style={{ marginTop: "20px" }}>
        {projects.length === 0 ? (
  <p>No projects found.</p>
) : (
  <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f2f2f2" }}>
        <th style={thStyle}>Phase</th>
        <th style={thStyle}>Title</th>
        <th style={thStyle}>Status</th>
        <th style={thStyle}>Description</th>
        <th style={thStyle}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {projects.map((project) => (
        <tr key={project.id}>
          <td style={tdStyle}>{project.phaseNumber}</td>
          <td style={tdStyle}>{project.title}</td>
          <td style={tdStyle}>{project.status}</td>
          <td style={tdStyle}>{project.description}</td>
          <td style={tdStyle}>
            <button
              onClick={() => setEditProject(project)}
              style={{ background: "orange", color: "white", marginRight: "5px" }}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(project.id)}
              style={{ background: "red", color: "white" }}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
        {/* {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="dev-card">

              <h3>
                Phase {project.phaseNumber}: {project.title}
              </h3>

              <p>Status: {project.status}</p>
              <p>{project.description}</p>

              <button
  onClick={() => setEditProject(project)}
  style={{ background: "orange", color: "white", marginRight: "10px" }}
>
  Edit
</button>

              <button
                onClick={() => handleDelete(project.id)}
                style={{ background: "red", color: "white", marginTop: "10px" }}
              >
                Delete
              </button>

            </div>
          ))
        )} */}

        {editProject && (
  <div style={overlayStyle}>
    <div style={modalStyle}>

      <button
        onClick={() => setEditProject(null)}
        style={{
          position: "absolute",
          top: "10px",
          right: "15px",
          background: "none",
          border: "none",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        ✕
      </button>

      <h3>Edit Development</h3>

      <input
        value={editProject.phaseNumber}
        onChange={(e) =>
          setEditProject({ ...editProject, phaseNumber: e.target.value })
        }
        placeholder="Phase Number"
      />

      <input
        value={editProject.title}
        onChange={(e) =>
          setEditProject({ ...editProject, title: e.target.value })
        }
        placeholder="Title"
      />

      <textarea
        value={editProject.description}
        onChange={(e) =>
          setEditProject({ ...editProject, description: e.target.value })
        }
        placeholder="Description"
      />

      <select
        value={editProject.status}
        onChange={(e) =>
          setEditProject({ ...editProject, status: e.target.value })
        }
      >
        <option value="PLANNED">UPCOMING</option>
        <option value="IN_PROGRESS">ONGOING</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>

      <button
        onClick={handleUpdate}
        style={{ marginTop: "10px", background: "green", color: "white" }}
      >
        Update
      </button>

    </div>
  </div>
)}
      </div>

    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  position: "relative",
  background: "white",
  padding: "30px",
  borderRadius: "8px",
  width: "400px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px"
};