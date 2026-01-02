import React from "react";
import "./donation.css";

const ProjectDetails = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{project.projectName}</h3>

        <p><b>Description:</b> {project.description}</p>
        <p><b>Required:</b> ₹{project.requiredAmount}</p>
        <p><b>Raised:</b> ₹{project.raisedAmount}</p>
        <p><b>State:</b> {project.allStates ? "ALL" : project.state}</p>
        <p><b>Pincode:</b> {project.allStates ? "-" : project.pincode}</p>

        {/* Images */}
        {project.imageUrls?.length > 0 && (
          <>
            <b>Images:</b>
            <ul>
              {project.imageUrls.map((img, i) => (
                <li key={i}>{img}</li>
              ))}
            </ul>
          </>
        )}

        {/* Videos */}
        {project.videoUrls?.length > 0 && (
          <>
            <b>Videos:</b>
            <ul>
              {project.videoUrls.map((vid, i) => (
                <li key={i}>{vid}</li>
              ))}
            </ul>
          </>
        )}

        <button className="btn-danger" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;
