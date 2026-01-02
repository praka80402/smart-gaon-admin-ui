import React, { useState } from "react";
import { updateDonationProject } from "./services/donationService";
import "./donation.css";

const EditProject = ({ project, onClose, onUpdated }) => {
  const [form, setForm] = useState(project);

  const save = async () => {
    await updateDonationProject(project.id, form);
    alert("Project Updated");
    onUpdated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Project</h3>

        <input
          value={form.projectName}
          onChange={(e) =>
            setForm({ ...form, projectName: e.target.value })
          }
        />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <input
          type="number"
          value={form.requiredAmount}
          onChange={(e) =>
            setForm({ ...form, requiredAmount: e.target.value })
          }
        />

        <button className="btn-primary" onClick={save}>
          Save
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProject;
