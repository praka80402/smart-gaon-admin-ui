// import React, { useState } from "react";
// import { updateDonationProject } from "./services/donationService";
// import "./donation.css";

// const EditProject = ({ project, onClose, onUpdated }) => {
//   const [form, setForm] = useState({
//     projectName: project.projectName,
//     description: project.description,
//     requiredAmount: project.requiredAmount,
//     allStates: project.allStates,
//     state: project.state,
//     pincode: project.pincode,
//   });

//   const save = async () => {
//     await updateDonationProject(project.id, form);
//     alert("Project Updated");
//     onUpdated();
//     onClose();
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-card">
//         <h3>Edit Project</h3>

//         <input
//           value={form.projectName}
//           onChange={(e) =>
//             setForm({ ...form, projectName: e.target.value })
//           }
//         />

//         <textarea
//           value={form.description}
//           onChange={(e) =>
//             setForm({ ...form, description: e.target.value })
//           }
//         />

//         <input
//           type="number"
//           value={form.requiredAmount}
//           onChange={(e) =>
//             setForm({ ...form, requiredAmount: e.target.value })
//           }
//         />

//         <button className="btn-primary" onClick={save}>Save</button>
//         <button className="btn-secondary" onClick={onClose}>Cancel</button>
//       </div>
//     </div>
//   );
// };

// export default EditProject;

import React, { useState } from "react";
import { updateDonationProject } from "./services/donationService";
import "./donation.css";

const EditProject = ({ project, onClose, onUpdated }) => {
  const [projectName, setProjectName] = useState(project.projectName);
  const [description, setDescription] = useState(project.description);
  const [requiredAmount, setRequiredAmount] = useState(project.requiredAmount);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const save = async () => {
    try {
      const formData = new FormData();
      formData.append("projectName", projectName);
      formData.append("description", description);
      formData.append("requiredAmount", requiredAmount);

      imageFiles.forEach((file) =>
        formData.append("imageFiles", file)
      );

      videoFiles.forEach((file) =>
        formData.append("videoFiles", file)
      );

      await updateDonationProject(project.id, formData);

      alert("Project updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Project</h3>

        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Required Amount"
          value={requiredAmount}
          onChange={(e) => setRequiredAmount(e.target.value)}
        />

        <label>Main Images (replace)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImageFiles(Array.from(e.target.files))}
        />

        <label>Main Videos (replace)</label>
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={(e) => setVideoFiles(Array.from(e.target.files))}
        />

        <div className="modal-actions">
          <button className="btn-primary" onClick={save}>
            Save
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProject;
