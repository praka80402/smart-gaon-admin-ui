
import React, { useEffect, useState } from "react";
import { getProjectById } from "./services/donationService";
import "./donation.css";

const ProjectDetails = ({ project, onClose }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (project?.id) {
      getProjectById(project.id).then((res) =>
        setDetails(res.data)
      );
    }
  }, [project]);

  if (!details) return null;

  const images = details.imageUrls || [];
  const videos = details.videoUrls || [];

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{details.projectName}</h3>

        <p><b>Description:</b> {details.description}</p>
        <p><b>Required:</b> ₹{details.requiredAmount}</p>
        <p><b>Raised:</b> ₹{details.raisedAmount}</p>
        <p>
          <b>Remaining:</b>{" "}
          ₹{details.requiredAmount - details.raisedAmount}
        </p>
        <p><b>State:</b> {details.allStates ? "ALL" : details.state}</p>
        <p><b>Pincode:</b> {details.allStates ? "-" : details.pincode}</p>

        {/* IMAGES */}
        {images.length > 0 && (
          <>
            <h4>Images</h4>
            <div className="media-grid">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="project"
                  className="project-media"
                />
              ))}
            </div>
          </>
        )}

        {/* VIDEOS */}
        {videos.length > 0 && (
          <>
            <h4>Videos</h4>
            <div className="media-grid">
              {videos.map((url, i) => (
                <video
                  key={i}
                  src={url}
                  controls
                  className="project-media"
                />
              ))}
            </div>
          </>
        )}

        {images.length === 0 && videos.length === 0 && (
          <p style={{ color: "gray" }}>No media uploaded</p>
        )}

        <button className="btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;
