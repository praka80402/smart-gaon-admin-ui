// // import { useEffect, useState } from "react";
// // import {
// //   getAllDevelopment,
// //   getByPhase,
// //   deleteDevelopment,updateDevelopment
// // } from "../service/developmentservice";
// // import "./development.css";

// // export default function DevelopmentList() {

// //   const [projects, setProjects] = useState([]);
// //   const [phaseFilter, setPhaseFilter] = useState("all");
// //   const [editProject, setEditProject] = useState(null);

// //   useEffect(() => {
// //     fetchProjects();
// //   }, [phaseFilter]);

// //   const fetchProjects = async () => {
// //     try {
// //       let res;

// //       if (phaseFilter === "all") {
// //         res = await getAllDevelopment();
// //       } else {
// //         res = await getByPhase(phaseFilter);
// //       }

// //       setProjects(res.data);

// //     } catch (error) {
// //       console.error(error);
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (window.confirm("Delete this project?")) {
// //       await deleteDevelopment(id);
// //       fetchProjects();
// //     }
// //   };

// //   const handleUpdate = async () => {
// //   try {
// //     const formData = new FormData();
// //     formData.append("phaseNumber", editProject.phaseNumber);
// //     formData.append("title", editProject.title);
// //     formData.append("description", editProject.description);
// //     formData.append("status", editProject.status);

// //     await updateDevelopment(editProject.id, formData);

// //     setEditProject(null);
// //     fetchProjects();

// //   } catch (error) {
// //     console.error(error);
// //   }
// // };

// //   return (
// //     <div className="dev-container">

// //       <h2>Development Project List</h2>

// //       <select
// //         value={phaseFilter}
// //         onChange={(e) => setPhaseFilter(e.target.value)}
// //       >
// //         <option value="all">All Phases</option>
// //         <option value="1">Phase 1</option>
// //         <option value="2">Phase 2</option>
// //         <option value="3">Phase 3</option>
// //       </select>

// //       <div style={{ marginTop: "20px" }}>
// //         {projects.length === 0 ? (
// //   <p>No projects found.</p>
// // ) : (
// //   <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
// //     <thead>
// //       <tr style={{ background: "#f2f2f2" }}>
// //         <th style={thStyle}>Phase</th>
// //         <th style={thStyle}>Title</th>
// //         <th style={thStyle}>Status</th>
// //         <th style={thStyle}>Description</th>
// //         <th style={thStyle}>Actions</th>
// //       </tr>
// //     </thead>
// //     <tbody>
// //       {projects.map((project) => (
// //         <tr key={project.id}>
// //           <td style={tdStyle}>{project.phaseNumber}</td>
// //           <td style={tdStyle}>{project.title}</td>
// //           <td style={tdStyle}>{project.status}</td>
// //           <td style={tdStyle}>{project.description}</td>
// //           <td style={tdStyle}>
// //             <button
// //               onClick={() => setEditProject(project)}
// //               style={{ background: "orange", color: "white", marginRight: "5px" }}
// //             >
// //               Edit
// //             </button>

// //             <button
// //               onClick={() => handleDelete(project.id)}
// //               style={{ background: "red", color: "white" }}
// //             >
// //               Delete
// //             </button>
// //           </td>
// //         </tr>
// //       ))}
// //     </tbody>
// //   </table>
// // )}
// //         {/* {projects.length === 0 ? (
// //           <p>No projects found.</p>
// //         ) : (
// //           projects.map((project) => (
// //             <div key={project.id} className="dev-card">

// //               <h3>
// //                 Phase {project.phaseNumber}: {project.title}
// //               </h3>

// //               <p>Status: {project.status}</p>
// //               <p>{project.description}</p>

// //               <button
// //   onClick={() => setEditProject(project)}
// //   style={{ background: "orange", color: "white", marginRight: "10px" }}
// // >
// //   Edit
// // </button>

// //               <button
// //                 onClick={() => handleDelete(project.id)}
// //                 style={{ background: "red", color: "white", marginTop: "10px" }}
// //               >
// //                 Delete
// //               </button>

// //             </div>
// //           ))
// //         )} */}

// //         {editProject && (
// //   <div style={overlayStyle}>
// //     <div style={modalStyle}>

// //       <button
// //         onClick={() => setEditProject(null)}
// //         style={{
// //           position: "absolute",
// //           top: "10px",
// //           right: "15px",
// //           background: "none",
// //           border: "none",
// //           fontSize: "18px",
// //           cursor: "pointer"
// //         }}
// //       >
// //         ✕
// //       </button>

// //       <h3>Edit Development</h3>

// //       <input
// //         value={editProject.phaseNumber}
// //         onChange={(e) =>
// //           setEditProject({ ...editProject, phaseNumber: e.target.value })
// //         }
// //         placeholder="Phase Number"
// //       />

// //       <input
// //         value={editProject.title}
// //         onChange={(e) =>
// //           setEditProject({ ...editProject, title: e.target.value })
// //         }
// //         placeholder="Title"
// //       />

// //       <textarea
// //         value={editProject.description}
// //         onChange={(e) =>
// //           setEditProject({ ...editProject, description: e.target.value })
// //         }
// //         placeholder="Description"
// //       />

// //       <select
// //         value={editProject.status}
// //         onChange={(e) =>
// //           setEditProject({ ...editProject, status: e.target.value })
// //         }
// //       >
// //         <option value="PLANNED">UPCOMING</option>
// //         <option value="IN_PROGRESS">ONGOING</option>
// //         <option value="COMPLETED">COMPLETED</option>
// //       </select>

// //       <button
// //         onClick={handleUpdate}
// //         style={{ marginTop: "10px", background: "green", color: "white" }}
// //       >
// //         Update
// //       </button>

// //     </div>
// //   </div>
// // )}
// //       </div>

// //     </div>
// //   );
// // }

// // const overlayStyle = {
// //   position: "fixed",
// //   top: 0,
// //   left: 0,
// //   width: "100%",
// //   height: "100%",
// //   background: "rgba(0,0,0,0.5)",
// //   display: "flex",
// //   justifyContent: "center",
// //   alignItems: "center"
// // };

// // const modalStyle = {
// //   position: "relative",
// //   background: "white",
// //   padding: "30px",
// //   borderRadius: "8px",
// //   width: "400px",
// //   display: "flex",
// //   flexDirection: "column",
// //   gap: "10px"
// // };
// // const thStyle = {
// //   border: "1px solid #ddd",
// //   padding: "10px",
// //   textAlign: "left"
// // };

// // const tdStyle = {
// //   border: "1px solid #ddd",
// //   padding: "10px"
// // };
// // -----------------------------

// import { useEffect, useState } from "react";
// import {
//   getAllDevelopment,
//   getByPhase,
//   updateDevelopment,
//   deleteDevelopment
// } from "../service/developmentservice";
// import "./list.css";

// export default function DevelopmentList() {

//   const [projects, setProjects] = useState([]);
//   const [phase, setPhase] = useState("all");
//   const [editData, setEditData] = useState(null);
//   const [newImages, setNewImages] = useState([]);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [expandedRow, setExpandedRow] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, [phase]);

//   const fetchData = async () => {
//     try {
//       let res;
//       if (phase === "all") {
//         res = await getAllDevelopment();
//       } else {
//         res = await getByPhase(phase);
//       }
//       setProjects(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//       setProjects([]);
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (!window.confirm("Delete this project?")) return;
//   //   await deleteDevelopment(id);
//   //   fetchData();
//   // };

//   const handleDelete = async (id) => {
//   try {

//     const confirmDelete = window.confirm("Delete this project?");
//     if (!confirmDelete) return;

//     await deleteDevelopment(id);

//     alert("Project Deleted Successfully");

//     fetchData();

//   } catch (error) {
//     console.error("Delete error:", error);
//   }
// };

//  const handleUpdate = async () => {
//   try {

//     const formData = new FormData();

//     formData.append("phaseNumber", editData.phaseNumber);
//     formData.append("masterId", editData.master?.id);
//     formData.append("description", editData.description);
//     formData.append("status", editData.status);

//     if (newImages.length > 0) {
//       newImages.forEach((img) => {
//         formData.append("images", img);
//       });
//     }

//     await updateDevelopment(editData.id, formData);

//     alert("Project Updated Successfully");

//     setEditData(null);
//     setNewImages([]);

//     fetchData();

//   } catch (error) {
//     console.error("Update error:", error);
//   }
// };

//   return (
//     <div className="wrapper">

//       <h2>Development Projects</h2>

//       <select
//         value={phase}
//         onChange={(e) => setPhase(e.target.value)}
//         className="phase-select"
//       >
//         <option value="all">All Phases</option>
//         <option value="1">Phase 1</option>
//         <option value="2">Phase 2</option>
//         <option value="3">Phase 3</option>
//       </select>

//       {projects.length === 0 ? (
//         <p>No projects found.</p>
//       ) : (
//         <table className="dev-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Phase</th>
//               <th>Description</th> 
//               <th>Status</th>
//               <th>Start</th>
//               <th>End</th>
//               <th>Image</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {projects.map((p) => (
//               <tr key={p.id}>
//                 <td>{p.id}</td>
//                 <td>{p.master?.title || "No Title"}</td>
//                 <td>{p.phaseNumber}</td>
//                  <td className="desc-cell">
//   {(() => {
//     const words = p.description?.split(" ") || [];
//     const isExpanded = expandedRow === p.id;

//     if (words.length <= 3) {
//       return p.description;
//     }

//     return (
//       <>
//         {isExpanded
//           ? p.description
//           : words.slice(0, 3).join(" ") + "..."}

//         <span
//           className="view-more"
//           onClick={() =>
//             setExpandedRow(isExpanded ? null : p.id)
//           }
//         >
//           {isExpanded ? " View Less" : " View More"}
//         </span>
//       </>
//     );
//   })()}
// </td>
//                 <td>{p.status}</td>
      

//                 <td>{p.startDate}</td>
//                 <td>{p.endDate}</td>

//                 <td>
//                   {p.master?.imageUrl && (
//                     <button
//                       className="view-btn"
//                       onClick={() =>
//                         setPreviewImage(p.master.imageUrl)
//                       }
//                     >
//                       View
//                     </button>
//                   )}
//                 </td>

//                 <td>
//                   <button
//                     className="edit-btn"
//                     onClick={() => setEditData(p)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="delete-btn"
//                     onClick={() => handleDelete(p.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* IMAGE PREVIEW MODAL */}
//      {/* IMAGE PREVIEW MODAL */}
// {previewImage && (
//   <div className="development-modal-overlay">
//     <div className="development-image-modal">

//       <button
//         className="development-modal-close"
//         onClick={() => setPreviewImage(null)}
//       >
//         ✕
//       </button>

//       <img src={previewImage} alt="Preview" />

//     </div>
//   </div>
// )}
// {editData && (
//   <div className="development-modal-overlay">
//     <div className="development-modal">

//       <div className="development-modal-header">
//         <h3>Edit Development</h3>
        
//         <button
//     className="development-modal-close"
//     onClick={() => setEditData(null)}
//   >
//     ✕
//   </button>

//       </div>
     

//       <div className="development-modal-body">

        

//         <div className="form-group">

//           <label>Phase Number</label>
//           <input
//             type="number"
//             value={editData.phaseNumber}
//             onChange={(e) =>
//               setEditData({
//                 ...editData,
//                 phaseNumber: e.target.value
//               })
//             }
//           />
//         </div>

//         <div className="form-group full">
//           <label>Description</label>
//           <textarea
//             rows="4"
//             value={editData.description}
//             onChange={(e) =>
//               setEditData({
//                 ...editData,
//                 description: e.target.value
//               })
//             }
//           />
//         </div>

//         <div className="form-group">
//           <label>Status</label>
//           {/* <select
//             value={editData.status}
//             onChange={(e) =>
//               setEditData({
//                 ...editData,
//                 status: e.target.value
//               })
//             }
//           >
//             <option value="UPCOMING">Upcoming</option>
//             <option value="ONGOING">Ongoing</option>
//             <option value="COMPLETE">Complete</option>
//           </select> */}

//           <select
//   value={editData.status}
//   onChange={(e) =>
//     setEditData({
//       ...editData,
//       status: e.target.value
//     })
//   }
// >
//   <option value="UPCOMING">Upcoming</option>
//   <option value="ONGOING">Ongoing</option>
//   <option value="COMPLETE">Complete</option>
// </select>
//         </div>

//         <div className="form-group">
//           <label>Add New Images</label>
//           <input
//             type="file"
//             multiple
//             onChange={(e) =>
//               setNewImages(Array.from(e.target.files))
//             }
//           />
//         </div>

//       </div>

//       <div className="development-modal-footer">
//         {/* <button
//           className="cancel-btn"
//           onClick={() => setEditData(null)}
//         >
//           Cancel
//         </button> */}

//         <button
//           className="save-btn"
//           onClick={handleUpdate}
//         >
//           Update
//         </button>
//       </div>

//     </div>
//   </div>
// )}
//     </div>
//   );
// }