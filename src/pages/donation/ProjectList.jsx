import React, { useEffect, useState } from "react";
import {
  getProjectsByLocation,
  deleteDonationProject,
} from "./services/donationService";
import ProjectDetails from "./ProjectDetails";
import ProjectDonations from "./ProjectDonations";
import EditProject from "./EditProject";
import "./donation.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [viewProject, setViewProject] = useState(null);
  const [viewDonations, setViewDonations] = useState(null);
  const [editProject, setEditProject] = useState(null);

  // 🔹 ADMIN LOADS ALL PROJECTS
  const loadProjects = async () => {
    const res = await getProjectsByLocation(null, null);
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="donation-table-container">
      <h3 className="donation-subtitle">Donation Projects</h3>

      <table className="donation-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Raised</th>
            <th>Required</th>
            <th>Remaining</th> {/* ✅ NEW COLUMN */}
            <th>State</th>
            <th>Pincode</th>
            <th>Project</th>
            <th>Donations</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No projects found
              </td>
            </tr>
          )}

          {projects.map((p) => {
            const remainingAmount =
              p.requiredAmount - p.raisedAmount;

            return (
              <tr key={p.id}>
                <td>{p.projectName}</td>

                <td>₹{p.raisedAmount}</td>
                <td>₹{p.requiredAmount}</td>

                {/* ✅ REMAINING AMOUNT */}
                <td>
                  ₹{remainingAmount}
                </td>

                <td>{p.allStates ? "ALL" : p.state}</td>
                <td>{p.allStates ? "-" : p.pincode}</td>

                {/* VIEW PROJECT */}
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => setViewProject(p)}
                  >
                    View
                  </button>
                </td>

                {/* VIEW DONATIONS */}
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => setViewDonations(p.id)}
                  >
                    View Donations
                  </button>
                </td>

                {/* ACTIONS */}
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => setEditProject(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-danger"
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this project?"
                        )
                      ) {
                        await deleteDonationProject(p.id);
                        loadProjects();
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PROJECT DETAILS MODAL */}
      {viewProject && (
        <ProjectDetails
          project={viewProject}
          onClose={() => setViewProject(null)}
        />
      )}

      {/* DONATIONS MODAL */}
      {viewDonations && (
        <ProjectDonations
          projectId={viewDonations}
          onClose={() => setViewDonations(null)}
        />
      )}

      {/* EDIT PROJECT MODAL */}
      {editProject && (
        <EditProject
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={loadProjects}
        />
      )}
    </div>
  );
};

export default ProjectList;
