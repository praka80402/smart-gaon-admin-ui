// import React, { useEffect, useState } from "react";
// import {
//   getProjects,
//   deleteDonationProject,
// } from "./services/donationService";

// import ProjectDetails from "./ProjectDetails";
// import ProjectDonations from "./ProjectDonations";
// import EditProject from "./EditProject";
// import GalleryModal from "./GalleryModal";
// import "./donation.css";

// const ProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [viewProject, setViewProject] = useState(null);
//   const [viewDonations, setViewDonations] = useState(null);
//   const [editProject, setEditProject] = useState(null);
//   const [galleryProject, setGalleryProject] = useState(null);

//   // LOAD ALL PROJECTS
//   const loadProjects = async () => {
//     try {
//       const res = await getProjects();
//       setProjects(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load projects");
//     }
//   };

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   return (
//     <div className="donation-table-container">
//       <h3 className="donation-subtitle">Donation Projects</h3>

//       <table className="donation-table">
//         <thead>
//           <tr>
//             <th>Project Name</th>
//             <th>Raised</th>
//             <th>Required</th>
//             <th>Remaining</th>
//             <th>State</th>
//             <th>Pincode</th>
//             <th>Project</th>
//             <th>Donations</th>
//             <th>Gallery</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {projects.length === 0 && (
//             <tr>
//               <td colSpan="10" style={{ textAlign: "center" }}>
//                 No projects found
//               </td>
//             </tr>
//           )}

//           {projects.map((p) => {
//             const remainingAmount = p.requiredAmount - p.raisedAmount;

//             return (
//               <tr key={p.id}>
//                 <td>{p.projectName}</td>
//                 <td>₹{p.raisedAmount}</td>
//                 <td>₹{p.requiredAmount}</td>
//                 <td>₹{remainingAmount}</td>
//                 <td>{p.allStates ? "ALL" : p.state}</td>
//                 <td>{p.allStates ? "-" : p.pincode}</td>

//                 {/* VIEW PROJECT */}
//                 <td>
//                   <button
//                     className="btn-secondary"
//                     onClick={() => setViewProject(p)}
//                   >
//                     View
//                   </button>
//                 </td>

//                 {/* VIEW DONATIONS */}
//                 <td>
//                   <button
//                     className="btn-primary"
//                     onClick={() => setViewDonations(p.id)}
//                   >
//                     View Donations
//                   </button>
//                 </td>

//                 {/* GALLERY */}
//                 <td>
//                   <button
//                     className="btn-primary"
//                     onClick={() => setGalleryProject(p)}
//                   >
//                     Gallery
//                   </button>
//                 </td>

//                 {/* ACTIONS */}
//                 <td>
//   <div className="action-buttons">
//     <button
//       className="btn-secondary"
//       onClick={() => setEditProject(p)}
//     >
//       Edit
//     </button>

//     <button
//       className="btn-danger"
//       onClick={async () => {
//         if (window.confirm("Are you sure you want to delete this project?")) {
//           await deleteDonationProject(p.id);
//           loadProjects();
//         }
//       }}
//     >
//       Delete
//     </button>
//   </div>
// </td>

//                 {/* <td>
//                   <button
//                     className="btn-secondary"
//                     style={{ marginRight: "8px" }} 
//                     onClick={() => setEditProject(p)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="btn-danger"
//                     onClick={async () => {
//                       if (
//                         window.confirm(
//                           "Are you sure you want to delete this project?"
//                         )
//                       ) {
//                         await deleteDonationProject(p.id);
//                         loadProjects();
//                       }
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </td> */}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {/* PROJECT DETAILS MODAL */}
//       {viewProject && (
//         <ProjectDetails
//           project={viewProject}
//           onClose={() => setViewProject(null)}
//         />
//       )}

//       {/* DONATIONS MODAL */}
//       {viewDonations && (
//         <ProjectDonations
//           projectId={viewDonations}
//           onClose={() => setViewDonations(null)}
//         />
//       )}

//       {/* EDIT PROJECT MODAL */}
//       {editProject && (
//         <EditProject
//           project={editProject}
//           onClose={() => setEditProject(null)}
//           onUpdated={loadProjects}
//         />
//       )}

//       {/* GALLERY MODAL */}
//       {galleryProject && (
//         <GalleryModal
//           project={galleryProject}
//           onClose={() => setGalleryProject(null)}
//           onUpdated={loadProjects}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectList;

import React, { useEffect, useState } from "react";
import {
  getProjects,
  deleteDonationProject,
} from "./services/donationService";

import ProjectDetails from "./ProjectDetails";
import ProjectDonations from "./ProjectDonations";
import EditProject from "./EditProject";
import GalleryModal from "./GalleryModal";
import "./donation.css";

const ProjectList = () => {

  // ================= STATE =================
  const [projects, setProjects] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 5;

  const [viewProject, setViewProject] = useState(null);
  const [viewDonations, setViewDonations] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [galleryProject, setGalleryProject] = useState(null);


  // ================= LOAD PROJECTS =================
  const loadProjects = async (page = 0) => {
    try {

      const res = await getProjects(page, pageSize);

      const data = res.data;

      if (data && data.content) {
        setProjects(data.content);
        setTotalPages(data.totalPages);
        setCurrentPage(data.number);
      } else {
        setProjects([]);
        setTotalPages(0);
        setCurrentPage(0);
      }

    } catch (err) {

      console.error(err);

      setProjects([]);
      setTotalPages(0);
      setCurrentPage(0);

      alert("Failed to load projects");
    }
  };


  // ================= ON LOAD =================
  useEffect(() => {
    loadProjects(0);
  }, []);


  // ================= PAGINATION =================
  const handlePrev = () => {
    if (currentPage > 0) {
      loadProjects(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      loadProjects(currentPage + 1);
    }
  };


  return (
    <div className="donation-table-container">

      <h3 className="donation-subtitle">Donation Projects</h3>


      


      {/* ================= TABLE ================= */}
      <table className="donation-table">

        <thead>
          <tr>
            <th>Project Name</th>
            <th>Raised</th>
            <th>Required</th>
            <th>Remaining</th>
            <th>State</th>
            <th>Pincode</th>
            <th>Project</th>
            <th>Donations</th>
            <th>Gallery</th>
            <th>Actions</th>
          </tr>
        </thead>


        <tbody>

          {projects?.length === 0 && (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No projects found
              </td>
            </tr>
          )}


          {projects?.map((p) => {

            const remainingAmount = p.requiredAmount - p.raisedAmount;

            return (
              <tr key={p.id}>

                <td>{p.projectName}</td>
                <td>₹{p.raisedAmount}</td>
                <td>₹{p.requiredAmount}</td>
                <td>₹{remainingAmount}</td>

                <td>{p.allStates ? "ALL" : p.state}</td>
                <td>{p.allStates ? "-" : p.pincode}</td>


                {/* VIEW */}
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => setViewProject(p)}
                  >
                    View
                  </button>
                </td>


                {/* DONATIONS */}
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => setViewDonations(p.id)}
                  >
                    View Donations
                  </button>
                </td>


                {/* GALLERY */}
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => setGalleryProject(p)}
                  >
                    Gallery
                  </button>
                </td>


                {/* ACTIONS */}
                <td>
                  <div className="action-buttons">

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

                          loadProjects(currentPage);
                        }
                      }}
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

      {/* ================= PAGINATION BAR ================= */}
      {/* ================= PAGINATION BOTTOM ================= */}
<div className="pagination-bar bottom-pagination">

  <button
    className="btn-secondary"
    onClick={handlePrev}
    disabled={currentPage === 0}
  >
    Prev
  </button>

  <span style={{ margin: "0 15px" }}>
    Page {currentPage + 1} of {totalPages}
  </span>

  <button
    className="btn-secondary"
    onClick={handleNext}
    disabled={currentPage === totalPages - 1}
  >
    Next
  </button>

</div>

      {/* ================= MODALS ================= */}

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
          onUpdated={() => loadProjects(currentPage)}
        />
      )}


      {galleryProject && (
        <GalleryModal
          project={galleryProject}
          onClose={() => setGalleryProject(null)}
          onUpdated={() => loadProjects(currentPage)}
        />
      )}

    </div>
  );
};

export default ProjectList;

