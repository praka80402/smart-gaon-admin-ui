// import { useEffect, useState } from "react";
// import { updateVillage } from "../service/villageservice";
// import { getByPhase } from "../service/developmentservice";
// import {
//   assignDevelopmentToVillage,
//   getVillageDevelopments,updateVillageDevelopment
// } from "../service/villageDevelopmentService";
// import "./villageDetail.css";

// export default function VillageDetail({ village }) {

//   // ================= BASIC INFO STATE =================
//   const [form, setForm] = useState({
//     name: village.name,
//     city: village.city,
//     state: village.state,
//     description: village.description,
//     smartGaon: village.smartGaon
//   });

//   // ================= DEVELOPMENT STATE =================
//   const [assigned, setAssigned] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [phase, setPhase] = useState("");
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [progress, setProgress] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [editMode, setEditMode] = useState(false);
// const [editItem, setEditItem] = useState(null);
// const [editProgress, setEditProgress] = useState("");
// const [editRemarks, setEditRemarks] = useState("");
// const [galleryImages, setGalleryImages] = useState([]);



//   useEffect(() => {
//     if (form.smartGaon) {
//       loadAssigned();
//     }
//   }, [form.smartGaon]);

//   const loadAssigned = async () => {
//     const data = await getVillageDevelopments(village.id);
//     setAssigned(data);
//   };

//   const handleEdit = (item) => {
//   setEditMode(true);
//   setEditItem(item);
//   setEditProgress(item.progressPercent);
//   setEditRemarks(item.remarks);
// };
//   // ================= HANDLE BASIC INFO CHANGE =================
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm({
//       ...form,
//       [name]: type === "checkbox" ? checked : value
//     });
//   };

//   // ================= UPDATE VILLAGE =================
//   const handleUpdateVillage = async () => {

//     const formData = new FormData();
//     formData.append("name", form.name);
//     formData.append("city", form.city);
//     formData.append("state", form.state);
//     formData.append("description", form.description);
//     formData.append("smartGaon", form.smartGaon);

//     await updateVillage(village.id, formData);
//     alert("Village Updated Successfully");
//   };

//   // ================= PHASE CHANGE =================
//   const handlePhaseChange = async (value) => {
//     setPhase(value);
//     const data = await getByPhase(value);
//     setProjects(data);
//   };

//   // ================= ASSIGN DEVELOPMENT =================
//   const handleAssign = async () => {
//     if (!selectedProject) return alert("Select project");

//     await assignDevelopmentToVillage({
//       villageId: village.id,
//       developmentId: selectedProject.id,
//       progress,
//       remarks
//     });

//     alert("Assigned Successfully");
//     setShowModal(false);
//     setProgress("");
//     setRemarks("");
//     setSelectedProject(null);
//     loadAssigned();
//   };
// const handleUpdateDevelopment = async () => {

//   const formData = new FormData();

//   formData.append("progress", editProgress);
//   formData.append("remarks", editRemarks);

//   // Send existing images (keep old ones)
//   if (editItem.galleryImages) {
//     editItem.galleryImages.forEach((img) => {
//       formData.append("existingImages", img);
//     });
//   }

//   // Send new images
//   for (let i = 0; i < galleryImages.length; i++) {
//     formData.append("images", galleryImages[i]);
//   }

//   await updateVillageDevelopment(editItem.id, formData);

//   alert("Development Updated Successfully");

//   setEditMode(false);
//   setEditItem(null);
//   setGalleryImages([]);
//   loadAssigned();
// };

//   return (
//     <div className="village-container">

//       <h2>Edit Village</h2>

//       {/* ================= BASIC DETAILS SECTION ================= */}

//       <div className="card">
//         <input
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Village Name"
//         />

//         <input
//           name="city"
//           value={form.city}
//           onChange={handleChange}
//           placeholder="City"
//         />

//         <input
//           name="state"
//           value={form.state}
//           onChange={handleChange}
//           placeholder="State"
//         />

//         <textarea
//           name="description"
//           value={form.description}
//           onChange={handleChange}
//           placeholder="Description"
//         />

//         <label>
//           <input
//             type="checkbox"
//             name="smartGaon"
//             checked={form.smartGaon}
//             onChange={handleChange}
//           />
//           Is Smart Gaon
//         </label>

//         <button className="primary-btn" onClick={handleUpdateVillage}>
//           Update Village
//         </button>
//       </div>

//       {/* ================= SMART GAON SECTION ================= */}

//       {form.smartGaon && (
//         <>
//           <h3 style={{ marginTop: "30px" }}>
//             Assigned Development Projects
//           </h3>
          
//          {assigned.length === 0 ? (
//   <p>No development assigned yet.</p>
// ) : (
//   assigned.map((item) => (
//     <div
//       key={item.id}
//       style={{
//         border: "1px solid #ddd",
//         padding: "15px",
//         marginBottom: "15px",
//         borderRadius: "8px",
//         backgroundColor: "#f9f9f9"
//       }}
//     >
//       <h4 style={{ marginBottom: "8px" }}>
//         Phase {item.development.phaseNumber} - {item.development.title}
//       </h4>

//       <p style={{ margin: "4px 0" }}>
//         <strong>Progress:</strong> {item.progressPercent}%
//       </p>

//       <p style={{ margin: "4px 0" }}>
//         <strong>Remarks:</strong> {item.remarks || "No remarks"}
//       </p>

//       <button
//         onClick={() => handleEdit(item)}
//         style={{
//           marginTop: "10px",
//           padding: "6px 14px",
//           backgroundColor: "#1976d2",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//           cursor: "pointer",
//           display: "inline-block"
//         }}
//       >
//         Edit
//       </button>
//     </div>
//   ))
// )}

//           <button
//             className="primary-btn"
//             onClick={() => setShowModal(true)}
//           >
//             Add Development Project
//           </button>
//         </>
//       )}

//       {/* ================= MODAL ================= */}

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal-box">

//             <button
//               className="close-btn"
//               onClick={() => setShowModal(false)}
//             >
//               ✕
//             </button>

//             <h3>Assign Development</h3>

//             <select
//               value={phase}
//               onChange={(e) => handlePhaseChange(e.target.value)}
//             >
//               <option value="">Select Phase</option>
//               <option value="1">Phase 1</option>
//               <option value="2">Phase 2</option>
//               <option value="3">Phase 3</option>
//             </select>

//             {projects.length > 0 && (
//               <div className="project-list">
//                 {projects.map((proj) => (
//                   <label key={proj.id}>
//                     <input
//                       type="radio"
//                       name="project"
//                       onChange={() => setSelectedProject(proj)}
//                     />
//                     {proj.title}
//                   </label>
//                 ))}
//               </div>
//             )}

//             {selectedProject && (
//               <>
//                 <input
//                   type="number"
//                   placeholder="Progress %"
//                   value={progress}
//                   onChange={(e) => setProgress(e.target.value)}
//                 />

//                 <textarea
//                   placeholder="Remarks"
//                   value={remarks}
//                   onChange={(e) => setRemarks(e.target.value)}
//                 />

//                 <button
//                   className="primary-btn"
//                   onClick={handleAssign}
//                 >
//                   Assign
//                 </button>
//               </>
//             )}

//           </div>
//         </div>
//       )}

//     {editMode && (
//   <div className="modal-overlay">
//     <div className="modal-box">

//       <button
//         className="close-btn"
//         onClick={() => {
//           setEditMode(false);
//           setGalleryImages([]);
//         }}
//       >
//         ✕
//       </button>

//       <h3>Edit Development</h3>

//       {/* Progress */}
//       <input
//         type="number"
//         min="0"
//         max="100"
//         value={editProgress}
//         onChange={(e) => setEditProgress(e.target.value)}
//         placeholder="Progress % (0-100)"
//       />

//       {/* Remarks */}
//       <textarea
//         value={editRemarks || ""}
//         onChange={(e) => setEditRemarks(e.target.value)}
//         placeholder="Remarks"
//       />

//       {/* Existing Images */}
//       {editItem?.galleryImages?.length > 0 && (
//         <div className="existing-gallery">
//           <h4>Existing Images</h4>

//           {editItem.galleryImages.map((img, index) => (
//             <div key={index} style={{ position: "relative", display: "inline-block", margin: "5px" }}>
//               <img
//                 src={img}
//                 alt="gallery"
//                 style={{ width: "80px", height: "80px", objectFit: "cover" }}
//               />

//               <button
//                 type="button"
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   right: 0,
//                   background: "red",
//                   color: "white",
//                   border: "none",
//                   cursor: "pointer"
//                 }}
//                 onClick={() => {
//                   const updatedImages = editItem.galleryImages.filter((_, i) => i !== index);
//                   setEditItem({
//                     ...editItem,
//                     galleryImages: updatedImages
//                   });
//                 }}
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Upload New Images */}
//       <input
//         type="file"
//         multiple
//         onChange={(e) => setGalleryImages(Array.from(e.target.files))}
//       />

//       <button
//         className="primary-btn"
//         onClick={handleUpdateDevelopment}
//         disabled={!editProgress}
//       >
//         Update
//       </button>

//     </div>
//   </div>
// )}

//     </div>
//   );
// }