
// import { useEffect, useState } from "react";
// import {
//   getAllVillages,
//   updateVillage,
//   deleteVillage,
// } from "./service/villageservice";
// import {
//   getVillageDevelopments,
//   assignDevelopmentToVillage,updateVillageDevelopment
// } from "./service/villageDevelopmentService";
// import { getAllDevelopment } from "./service/developmentservice";
// import { getByPhase } from "./service/developmentservice";
// import "./VillageList.css";
// import VillageView from "./edit/VillageView";

// export default function VillageList() {
//   const [villages, setVillages] = useState([]);
//   const [selectedVillage, setSelectedVillage] = useState(null);
//   const [form, setForm] = useState({});
//   const [assigned, setAssigned] = useState([]);
//   const [phase, setPhase] = useState("");
//   const [phases, setPhases] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [progress, setProgress] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [addImages, setAddImages] = useState([]);
// const [addVideoUrl, setAddVideoUrl] = useState("");
// const [addReports, setAddReports] = useState([]);
//   const [viewVillage, setViewVillage] = useState(null);
//   const [editDev, setEditDev] = useState(null);
// const [editProgress, setEditProgress] = useState("");
// const [editRemarks, setEditRemarks] = useState("");
// const [existingImages, setExistingImages] = useState([]);
// const [newImages, setNewImages] = useState([]);
// const [videoUrl, setVideoUrl] = useState("");
// const [existingReports, setExistingReports] = useState([]);
// const [newReports, setNewReports] = useState([]);

//   useEffect(() => {
//     fetchVillages();
//      fetchPhases();
//   }, []);

//   const fetchVillages = async () => {
//     const res = await getAllVillages();
//     setVillages(res.data);
//   };
//   const fetchPhases = async () => {

//   const res = await getAllDevelopment();

//   const uniquePhases = [
//     ...new Set(res.data.map(d => d.phaseNumber))
//   ];

//   uniquePhases.sort((a, b) => a - b);

//   setPhases(uniquePhases);
// };

//   const handleView = (v) => {
//   setViewVillage(v);
// };

//   // ---------------- EDIT OPEN ----------------
//   const handleEdit = async (v) => {
//     setSelectedVillage(v);
//     setForm({ ...v });
//     setSelectedProject(null);
//     setProgress("");
//     setRemarks("");
//     setProjects([]);
//     setPhase("");

//     if (v.smartGaon) {
//       const data = await getVillageDevelopments(v.id);
//       setAssigned(data);
//     } else {
//       setAssigned([]);
//     }
//   };

//   // ---------------- UPDATE ----------------
// const handleUpdate = async () => {

//   const payload = {
//     name: form.name,
//     city: form.city,
//     state: form.state,
//     description: form.description,
//     smartGaon: form.smartGaon
//   };

//   await updateVillage(selectedVillage.id, payload);

//   alert("Village Updated Successfully");
//   fetchVillages();
//   setSelectedVillage(null);
// };

//   // ---------------- DELETE ----------------
//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this village?")) {
//       await deleteVillage(id);
//       fetchVillages();
//     }
//   };

//   // ---------------- PHASE ----------------
//  const handlePhaseChange = async (value) => {
//   setPhase(value);

//   const res = await getByPhase(value);
//   setProjects(res?.data ?? []);

//   setSelectedProject(null);
// };

//   // ---------------- ASSIGN ----------------
//   const handleAssign = async () => {
//     if (!selectedProject) {
//       alert("Select a project");
//       return;
//     }

//     await assignDevelopmentToVillage({
//       villageId: selectedVillage.id,
//       developmentId: selectedProject.id,
//       progress,
//       remarks,
//     });

//     alert("Development Added Successfully");

//     const data = await getVillageDevelopments(selectedVillage.id);
//     setAssigned(data);

//     setSelectedProject(null);
//     setProgress("");
//     setRemarks("");
//   };

//   return (
//     <div className="village-list-container">
//       <h2>All Villages</h2>

//       {/* {villages.map((v) => (
//         <div key={v.id} className="village-card">
//           <h3>
//             {v.name}{" "}
//             {v.smartGaon && <span className="smart-badge">SMART</span>}
//           </h3>
//           <p>
//             {v.city}, {v.state}
//           </p>
//           <button onClick={() => handleView(v)}>View</button>
//           <button onClick={() => handleEdit(v)}>Edit</button>
//           <button onClick={() => handleDelete(v.id)}>Delete</button>
//         </div>
      
//       ))} */}
//       <table className="village-table">
//   <thead>
//     <tr>
//       <th>ID</th>
//       <th>Village Name</th>
//       <th>City</th>
//       <th>State</th>
//       <th>Smart Gaon</th>
//       <th>Actions</th>
//     </tr>
//   </thead>

//   <tbody>
//     {villages.map((v) => (
//       <tr key={v.id}>
//         <td>{v.id}</td>
//         <td>{v.name}</td>
//         <td>{v.city}</td>
//         <td>{v.state}</td>
//         <td>
//           {v.smartGaon ? (
//             <span className="smart-badge">SMART</span>
//           ) : (
//             "No"
//           )}
//         </td>

//         <td>
//           <button onClick={() => handleView(v)}>View</button>
//           <button onClick={() => handleEdit(v)}>Edit</button>
//           <button onClick={() => handleDelete(v.id)}>Delete</button>
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>





//       {/* ================= MODAL ================= */}
//       {selectedVillage && (
//         <div className="modal-overlay">
//           <div className="modal-box-large">
//             <button
//               className="close-btn"
//               onClick={() => setSelectedVillage(null)}
//             >
//               ✕
//             </button>

//             <h3>Edit Village</h3>

            

//             <input
//               value={form.name || ""}
//               onChange={(e) =>
//                 setForm({ ...form, name: e.target.value })
//               }
//               placeholder="Village Name"
//             />

//             <input
//               value={form.city || ""}
//               onChange={(e) =>
//                 setForm({ ...form, city: e.target.value })
//               }
//               placeholder="City"
//             />

//             <input
//               value={form.state || ""}
//               onChange={(e) =>
//                 setForm({ ...form, state: e.target.value })
//               }
//               placeholder="State"
//             />

//             <textarea
//               value={form.description || ""}
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
//               placeholder="Description"
//             />
//                 {/* Existing Images */}
// {form.imageFiles && (
//   <div className="image-preview-grid">
//     {form.imageFiles.split(",").map((img, i) => (
//       <img
//         key={i}
//         src={img}
//         alt="village"
//         className="preview-img"
//       />
//     ))}
//   </div>
// )}

// {/* Upload New Images */}
// <input
//   type="file"
//   multiple
//   onChange={(e) => setNewImages(Array.from(e.target.files))}
// />


//             <label>
//               <input
//                 type="checkbox"
//                 checked={form.smartGaon || false}
//                 onChange={(e) =>
//                   setForm({ ...form, smartGaon: e.target.checked })
//                 }
//               />
//               Smart Gaon
//             </label>

//             <button onClick={handleUpdate}>Update Village</button>

//             {/* ===== DEVELOPMENT SECTION ===== */}
//             {form.smartGaon && (
//               <>
//                 <hr />
//                 <h4>Assigned Development</h4>

//                 {assigned.length === 0 && (
//                   <p>No development assigned yet</p>
//                 )}

                

//                 {assigned.map((item) => (
//   <div
//     key={item.id}
//     style={{
//       border: "1px solid #ddd",
//       padding: "12px",
//       marginBottom: "10px",
//       borderRadius: "8px",
//       background: "#f9fafb"
//     }}
//   >
//     <div style={{ fontWeight: "600" }}>
//      Phase {item.development.phaseNumber} – {item.development.master?.title || "Development"}
//     </div>

//     <div>Progress: {item.progressPercent}%</div>
//     <div>Remarks: {item.remarks || "—"}</div>

//     <button
//       style={{
//         marginTop: "8px",
//         padding: "5px 12px",
//         background: "#2563eb",
//         color: "white",
//         border: "none",
//         borderRadius: "6px",
//         cursor: "pointer"
//       }}
    
//       onClick={() => {
//   setEditDev(item);
//   setEditProgress(item.progressPercent);
//   setEditRemarks(item.remarks || "");
//   setExistingImages(item.galleryImages || []);
//   setExistingReports(item.reports || []);   
//   setVideoUrl(item.videoUrl || "");        
//   setNewImages([]);
//   setNewReports([]);                       
// }}
//     >
//       Edit
//     </button>
//   </div>
// ))}
//      {editDev && (
//   <div
//     style={{
//       marginTop: "20px",
//       padding: "20px",
//       border: "1px solid #d1d5db",
//       borderRadius: "10px",
//       background: "#f9fafb"
//     }}
//   >
//     <h4 style={{ marginBottom: "10px" }}>Edit Development</h4>

//     {/* Progress */}
//     <div style={{ marginBottom: "10px" }}>
//       <label>Progress %</label>
//       <input
//         type="number"
//         min="0"
//         max="100"
//         value={editProgress}
//         onChange={(e) => setEditProgress(e.target.value)}
//         style={{ width: "100%", padding: "6px", marginTop: "4px" }}
//       />
//     </div>

//     {/* Remarks */}
//     <div style={{ marginBottom: "10px" }}>
//       <label>Remarks</label>
//       <input
//         value={editRemarks}
//         onChange={(e) => setEditRemarks(e.target.value)}
//         style={{ width: "100%", padding: "6px", marginTop: "4px" }}
//       />

//     </div>
//     <div style={{ marginTop: "10px" }}>
//   <label>YouTube Video URL</label>

//   <input
//     type="text"
//     value={videoUrl}
//     onChange={(e) => setVideoUrl(e.target.value)}
//     placeholder="https://youtube.com/watch?v=..."
//     style={{ width: "100%", padding: "6px" }}
//   />
// </div>

//     {/* Existing Images */}
//     {existingImages.length > 0 && (
//       <>
//         <h5>Existing Images</h5>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//           {existingImages.map((img, index) => (
//             <div key={index} style={{ position: "relative" }}>
//               <img
//                 src={img}
//                 alt="gallery"
//                 style={{
//                   width: "90px",
//                   height: "90px",
//                   objectFit: "cover",
//                   borderRadius: "6px"
//                 }}
//               />
//               <button
//                 type="button"
//                 style={{
//                   position: "absolute",
//                   top: "0",
//                   right: "0",
//                   background: "red",
//                   color: "white",
//                   border: "none",
//                   cursor: "pointer",
//                   padding: "2px 6px",
//                   borderRadius: "4px"
//                 }}
//                 onClick={() =>
//                   setExistingImages(
//                     existingImages.filter((_, i) => i !== index)
//                   )
//                 }
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       </>
//     )}

//     {existingReports.length > 0 && (
//   <>
//     <h5>Existing Reports</h5>

//     {existingReports.map((rep, index) => (
//       <div key={index}>
//         <a href={rep} target="_blank">Report {index + 1}</a>

//         <button
//           onClick={() =>
//             setExistingReports(
//               existingReports.filter((_, i) => i !== index)
//             )
//           }
//         >
//           ✕
//         </button>
//       </div>
//     ))}
//   </>
// )}

//     {/* Upload New Images */}
//     <div style={{ marginTop: "15px" }}>
//       <label>Add New Images</label>
//       <input
//         type="file"
//         multiple
//         onChange={(e) => setNewImages(Array.from(e.target.files))}
//         style={{ display: "block", marginTop: "6px" }}
//       />
//     </div>

//     <div style={{ marginTop: "10px" }}>
//   <label>Add PDF Reports</label>

//   <input
//     type="file"
//     multiple
//     accept="application/pdf"
//     onChange={(e) =>
//       setNewReports(Array.from(e.target.files))
//     }
//   />
// </div>

//     {/* Buttons Row */}
//     <div
//       style={{
//         marginTop: "15px",
//         display: "flex",
//         gap: "10px"
//       }}
//     >
//       <button
//         style={{
//           padding: "8px 14px",
//           background: "green",
//           color: "white",
//           border: "none",
//           borderRadius: "6px",
//           cursor: "pointer"
//         }}

//     onClick={async () => {

//   const formData = new FormData();

//   // basic fields
//   formData.append("progress", editProgress);
//   formData.append("remarks", editRemarks);
//   formData.append("videoUrl", videoUrl);

//   // existing images
//   existingImages.forEach((img) =>
//     formData.append("existingImages", img)
//   );

//   // existing reports
//   existingReports.forEach((rep) =>
//     formData.append("existingReports", rep)
//   );

//   // new images
//   newImages.forEach((img) =>
//     formData.append("images", img)
//   );

//   // new reports
//   newReports.forEach((pdf) =>
//     formData.append("reports", pdf)
//   );

//   await updateVillageDevelopment(editDev.id, formData);

//   const data = await getVillageDevelopments(selectedVillage.id);
//   setAssigned(data);

//   setEditDev(null);
//   setExistingImages([]);
//   setExistingReports([]);
//   setNewImages([]);
//   setNewReports([]);
//   setVideoUrl("");
// }}


//       >
//         Update Development
//       </button>

//       <button
//         style={{
//           padding: "8px 14px",
//           background: "#6b7280",
//           color: "white",
//           border: "none",
//           borderRadius: "6px",
//           cursor: "pointer"
//         }}
//         onClick={() => {
//           setEditDev(null);
//           setExistingImages([]);
//           setNewImages([]);
//           setEditProgress("");
//           setEditRemarks("");
//         }}
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// )}
//                 <hr />
//                 <h4>Add Development</h4>

//                 <select
//                   value={phase}
//                   onChange={(e) =>
//                     handlePhaseChange(e.target.value)
//                   }
//                 >
//                     <option value="">Select Phase</option>

//                   {/* <option value="">Select Phase</option>
//                   <option value="1">Phase 1</option>
//                   <option value="2">Phase 2</option>
//                   <option value="3">Phase 3</option> */}
//                   {phases.map((p) => (
//   <option key={p} value={p}>
//     Phase {p}
//   </option>
// ))}
//                 </select>

//               {projects.length === 0 && (
//   <p style={{ marginTop: "10px" }}>No projects found</p>
// )}

// {projects.map((p) => (
//   <div key={p.id} style={{ marginTop: "6px" }}>
//     <input
//       type="radio"
//       name="project"
//       checked={selectedProject?.id === p.id}
//       onChange={() => setSelectedProject(p)}
//     />

//     {p.master?.title || "Development"}
//   </div>
// ))}

//                 <input
//                   value={progress}
//                   placeholder="Progress %"
//                   onChange={(e) =>
//                     setProgress(e.target.value)
//                   }
//                 />



//                 <input
//                   value={remarks}
//                   placeholder="Remarks"
//                   onChange={(e) =>
//                     setRemarks(e.target.value)
//                   }
//                 />
//                 {/* Upload Images */}
// <div style={{ marginTop: "10px" }}>
//   <label>Upload Images</label>

//   <input
//     type="file"
//     multiple
//     accept="image/*"
//     onChange={(e) =>
//       setAddImages(Array.from(e.target.files))
//     }
//   />
// </div>

// {/* YouTube Video */}
// <div style={{ marginTop: "10px" }}>
//   <label>YouTube Video URL</label>

//   <input
//     type="text"
//     value={addVideoUrl}
//     onChange={(e) => setAddVideoUrl(e.target.value)}
//     placeholder="https://youtube.com/watch?v=..."
//   />
// </div>

// {/* Upload Reports */}
// <div style={{ marginTop: "10px" }}>
//   <label>Upload PDF Reports</label>

//   <input
//     type="file"
//     multiple
//     accept="application/pdf"
//     onChange={(e) =>
//       setAddReports(Array.from(e.target.files))
//     }
//   />
// </div>



//                 <button onClick={handleAssign}>
//                   Add Development
//                 </button>
//               </>
//             )}
   
//           </div>
//         </div>
//       )}

              
//           {viewVillage && (
//   <div className="view-overlay">
//     <div className="view-box-large">

//       <button
//         onClick={() => setViewVillage(null)}
//         style={{
//           position: "absolute",
//           top: "18px",
//           right: "22px",
//           background: "#ef4444",
//           color: "white",
//           border: "none",
//           padding: "6px 10px",
//           borderRadius: "6px",
//           fontSize: "14px",
//           cursor: "pointer"
//         }}
//       >
//         ✕
//       </button>

//       <VillageView village={viewVillage} />

//     </div>
//   </div>
// )}

//     </div>
//   );
// }

import { useEffect, useState } from "react";

import {
  getAllVillages,
  updateVillage,
  deleteVillage,
} from "./service/villageservice";

import {
  getVillageDevelopments,
} from "./service/villageDevelopmentService";

import {
  getAllDevelopment,
  getByPhase
} from "./service/developmentservice";

import AssignDevelopment from "./edit/AssignDevelopment";
import EditDevelopmentModal from "./edit/EditDevelopmentModal";
import VillageView from "./edit/VillageView";

import "./VillageList.css";

export default function VillageList() {

  const [villages,setVillages] = useState([]);
  const [selectedVillage,setSelectedVillage] = useState(null);
  const [viewVillage,setViewVillage] = useState(null);

  const [form,setForm] = useState({});
  const [assigned,setAssigned] = useState([]);

  const [phases,setPhases] = useState([]);

  const [editDev,setEditDev] = useState(null);
  const [editProgress,setEditProgress] = useState("");
  const [editRemarks,setEditRemarks] = useState("");

  const [existingImages,setExistingImages] = useState([]);
  const [newImages,setNewImages] = useState([]);

  const [videoUrl,setVideoUrl] = useState("");

  const [existingReports,setExistingReports] = useState([]);
  const [newReports,setNewReports] = useState([]);

  const [activeTab, setActiveTab] = useState("village");

  useEffect(()=>{
    fetchVillages();
    fetchPhases();
  },[]);

  const fetchVillages = async ()=>{
    const res = await getAllVillages();
    setVillages(res.data);
  };

  const fetchPhases = async ()=>{

    const res = await getAllDevelopment();

    const uniquePhases = [
      ...new Set(res.data.map(d=>d.phaseNumber))
    ];

    uniquePhases.sort((a,b)=>a-b);

    setPhases(uniquePhases);
  };

  const handleView = (v)=>{
    setViewVillage(v);
  };

  const handleEdit = async(v)=>{

    setSelectedVillage(v);
    setForm({...v});

    if(v.smartGaon){

      const data = await getVillageDevelopments(v.id);
      setAssigned(data);

    }else{

      setAssigned([]);

    }
  };

  const handleDelete = async(id)=>{

    if(window.confirm("Delete this village?")){

      await deleteVillage(id);

      fetchVillages();
    }
  };

  const handleUpdate = async()=>{

    const payload = {
      name: form.name,
      city: form.city,
      state: form.state,
      description: form.description,
      smartGaon: form.smartGaon
    };

    await updateVillage(selectedVillage.id,payload);

    alert("Village Updated Successfully");

    fetchVillages();

    setSelectedVillage(null);
  };

  const filteredVillages = villages.filter(v =>
  activeTab === "smart"
    ? v.smartGaon === true
    : v.smartGaon === false
);

  return (

    <div className="village-list-container">

      <h2>All Villages</h2>
  
  <div className="village-tabs">

  <button
    className={activeTab === "village" ? "active-tab" : ""}
    onClick={() => setActiveTab("village")}
  >
    Villages
  </button>

  <button
    className={activeTab === "smart" ? "active-tab" : ""}
    onClick={() => setActiveTab("smart")}
  >
    Smart Villages
  </button>

</div>


      <table className="village-table">

        <thead>

          <tr>
            <th>ID</th>
            <th>Village</th>
            <th>City</th>
            <th>State</th>
            <th>Smart</th>
            <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {/* {villages.map(v=>( */}
          {filteredVillages.map(v => (
            <tr key={v.id}>

              <td>{v.id}</td>
              <td>{v.name}</td>
              <td>{v.city}</td>
              <td>{v.state}</td>

              <td>
                {v.smartGaon ? "SMART" : "No"}
              </td>

              <td>

                <button onClick={()=>handleView(v)}>
                  View
                </button>

                <button onClick={()=>handleEdit(v)}>
                  Edit
                </button>

                <button onClick={()=>handleDelete(v.id)}>
                  Delete
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

      {/* EDIT MODAL */}

      {selectedVillage && (

        <div className="modal-overlay">

          <div className="modal-box-large">

            <button
              className="close-btn"
              onClick={()=>setSelectedVillage(null)}
            >
              ✕
            </button>

            <h3>Edit Village</h3>

            <input
              value={form.name || ""}
              onChange={(e)=>
                setForm({...form,name:e.target.value})
              }
              placeholder="Village Name"
            />

            <input
              value={form.city || ""}
              onChange={(e)=>
                setForm({...form,city:e.target.value})
              }
              placeholder="City"
            />

            <input
              value={form.state || ""}
              onChange={(e)=>
                setForm({...form,state:e.target.value})
              }
              placeholder="State"
            />

            <textarea
              value={form.description || ""}
              onChange={(e)=>
                setForm({...form,description:e.target.value})
              }
              placeholder="Description"
            />

            <label>

              <input
                type="checkbox"
                checked={form.smartGaon || false}
                onChange={(e)=>
                  setForm({...form,smartGaon:e.target.checked})
                }
              />

              Smart Gaon

            </label>

            <button onClick={handleUpdate}>
              Update Village
            </button>

            {form.smartGaon && (

              <>

                <hr/>

                <h4>Assigned Development</h4>

                {assigned.map(item=>(
                  <div key={item.id}>

                    Phase {item.development.phaseNumber}
                    {" "}
                    {item.development.master?.title}

                    <br/>

                    Progress: {item.progressPercent}%

                    <button
                      onClick={()=>{

                        setEditDev(item);

                        setEditProgress(item.progressPercent);
                        setEditRemarks(item.remarks || "");

                        setExistingImages(item.galleryImages || []);
                        setExistingReports(item.reports || []);
                        setVideoUrl(item.videoUrl || "");

                      }}
                    >
                      Edit
                    </button>

                  </div>
                ))}

              
                {/* EDIT DEVELOPMENT */}

<EditDevelopmentModal
  selectedVillage={selectedVillage}
  editDev={editDev}
  setEditDev={setEditDev}
  editProgress={editProgress}
  setEditProgress={setEditProgress}
  editRemarks={editRemarks}
  setEditRemarks={setEditRemarks}
  existingImages={existingImages}
  setExistingImages={setExistingImages}
  newImages={newImages}
  setNewImages={setNewImages}
  videoUrl={videoUrl}
  setVideoUrl={setVideoUrl}
  existingReports={existingReports}
  setExistingReports={setExistingReports}
  newReports={newReports}
  setNewReports={setNewReports}
  refreshDevelopment={async ()=>{
    const data = await getVillageDevelopments(selectedVillage.id);
    setAssigned(data);
  }}
/>

                <hr/>

                {/* ASSIGN DEVELOPMENT */}

                <AssignDevelopment
                  selectedVillage={selectedVillage}
                  phases={phases}
                  getByPhase={getByPhase}
                  refreshDevelopment={async ()=>{
                    const data = await getVillageDevelopments(selectedVillage.id);
                    setAssigned(data);
                  }}
                />

              </>
            )}

          </div>

        </div>

      )}

      {/* {viewVillage && (
        <VillageView village={viewVillage}/>
      )} */}

{viewVillage && (

  <div className="modal-overlay">

    <div className="modal-box-large">

      <button
        className="close-btn"
        onClick={() => setViewVillage(null)}
      >
        ✕
      </button>

      <VillageView village={viewVillage} />

    </div>

  </div>

)}
    </div>
  );
}