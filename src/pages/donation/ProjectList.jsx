// import React, { useEffect, useState } from "react";
// import { getProjectsByLocation } from "./services/donationService";
// import ProjectDonations from "./ProjectDonations";
// import ProjectDetails from "./ProjectDetails";
// import "./donation.css";

// const ProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [viewProject, setViewProject] = useState(null);
//   const [viewDonations, setViewDonations] = useState(null);

//   useEffect(() => {
//     getProjectsByLocation("BIHAR", "000000")
//       .then((res) => setProjects(res.data));
//   }, []);

//   return (
//     <div className="donation-table-container">
//       <h3 className="donation-subtitle">Donation Projects</h3>

//       <table className="donation-table">
//         <thead>
//           <tr>
//             <th>Project Name</th>
//             <th>Raised / Required</th>
//             <th>State</th>
//             <th>Pincode</th>
//             <th>Project</th>
//             <th>Donations</th>
//           </tr>
//         </thead>

//         <tbody>
//           {projects.map((p) => (
//             <tr key={p.id}>
//               <td>{p.projectName}</td>
//               <td>₹{p.raisedAmount} / ₹{p.requiredAmount}</td>
//               <td>{p.allStates ? "ALL" : p.state}</td>
//               <td>{p.allStates ? "-" : p.pincode}</td>

//               <td>
//                 <button
//                   className="btn-secondary"
//                   onClick={() => setViewProject(p)}
//                 >
//                   View
//                 </button>
//               </td>

//               <td>
//                 <button
//                   className="btn-primary"
//                   onClick={() => setViewDonations(p.id)}
//                 >
//                   View Donations
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* ✅ Project Details Modal */}
//       {viewProject && (
//         <ProjectDetails
//           project={viewProject}
//           onClose={() => setViewProject(null)}
//         />
//       )}

//       {/* ✅ Donations Modal */}
//       {viewDonations && (
//         <ProjectDonations
//           projectId={viewDonations}
//           onClose={() => setViewDonations(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectList;

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

  const loadProjects = () => {
    getProjectsByLocation("BIHAR", "000000")
      .then((res) => setProjects(res.data));
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
            <th>Raised / Required</th>
            <th>State</th>
            <th>Pincode</th>
            <th>Project</th>
            <th>Donations</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.projectName}</td>
              <td>₹{p.raisedAmount} / ₹{p.requiredAmount}</td>
              <td>{p.allStates ? "ALL" : p.state}</td>
              <td>{p.allStates ? "-" : p.pincode}</td>

              <td>
                <button
                  className="btn-secondary"
                  onClick={() => setViewProject(p)}
                >
                  View
                </button>
              </td>

              <td>
                <button
                  className="btn-primary"
                  onClick={() => setViewDonations(p.id)}
                >
                  View Donations
                </button>
              </td>

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
                    if (window.confirm("Delete this project?")) {
                      await deleteDonationProject(p.id);
                      loadProjects();
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewProject && (
        <ProjectDetails
          project={viewProject}
          onClose={() => setViewProject(null)}
        />
      )}

      {viewDonations && (
        <ProjectDonations
          projectId={viewDonations}
          onClose={() => setViewDonations(null)}
        />
      )}

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
