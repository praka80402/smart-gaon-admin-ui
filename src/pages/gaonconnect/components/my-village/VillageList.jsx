// import { useEffect, useState } from "react";
// import "./VillageForm.css";

//  const BASE_URL = "https://smartgaonadmin.duckdns.org/admin";
// // const BASE_URL = "http://localhost:9090/admin";
// export default function VillageForm({ data, onClose }) {

//   const isEdit = !!data?.id;

//   const [form, setForm] = useState({
//     name: "",
//     city: "",
//     state: "",
//     description: ""
//   });

//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);

//   const [allDevelopments, setAllDevelopments] = useState([]);
//   const [selectedDevelopments, setSelectedDevelopments] = useState({});

//   useEffect(() => {

//     setForm({
//       name: data?.name || "",
//       city: data?.city || "",
//       state: data?.state || "",
//       description: data?.description || ""
//     });

//     setExistingImages(data?.images || []);
//     setNewImages([]);
//     setPreviewUrls([]);

//     fetch(`${BASE_URL}/developments`, {
//       headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") }
//     })
//       .then(res => res.json())
//       .then(devs => setAllDevelopments(devs));

//     if (data?.developments) {
//       const map = {};
//       data.developments.forEach(d => map[d.developmentId] = d);
//       setSelectedDevelopments(map);
//     }

//   }, [data]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const files = [...e.target.files];
//     setNewImages(files);
//     setPreviewUrls(files.map(file => URL.createObjectURL(file)));
//   };

//   const removeExistingImage = (img) => {
//     setExistingImages(existingImages.filter(i => i !== img));
//   };

//   const removeNewImage = (index) => {
//     setNewImages(newImages.filter((_, i) => i !== index));
//     setPreviewUrls(previewUrls.filter((_, i) => i !== index));
//   };

//   const toggleDevelopment = (devId) => {

//     const updated = { ...selectedDevelopments };

//     if (updated[devId]) delete updated[devId];
//     else updated[devId] = {
//       developmentId: devId,
//       workDescription: "",
//       benefit: "",
//       progressPercent: 0
//     };

//     setSelectedDevelopments(updated);
//   };

//   const updateDevField = (devId, field, value) => {
//     setSelectedDevelopments({
//       ...selectedDevelopments,
//       [devId]: {
//         ...selectedDevelopments[devId],
//         [field]: value
//       }
//     });
//   };

//   const handleSubmit = async () => {

//     try {

//       const fd = new FormData();

//       fd.append("name", form.name);
//       fd.append("city", form.city);
//       fd.append("state", form.state);
//       fd.append("description", form.description);

//       existingImages.forEach(img => fd.append("existingImages", img));
//       newImages.forEach(img => fd.append("images", img));

//       fd.append("developments", JSON.stringify(Object.values(selectedDevelopments)));

//       const url = isEdit
//         ? `${BASE_URL}/villages/${data.id}/upload`
//         : `${BASE_URL}/villages/upload`;

//       const method = isEdit ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") },
//         body: fd
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         alert(txt);
//         return;
//       }

//       const updatedVillage = await res.json();
//       alert("Village saved successfully");
//       onClose(updatedVillage);

//     } catch (err) {
//       console.error(err);
//       alert("Save failed");
//     }
//   };

//   return (
//     <div className="village-form-wrapper">

//       <h2>{isEdit ? "Edit Village" : "Add Village"}</h2>

//       <label>Village Name</label>
//       <input name="name" value={form.name} onChange={handleChange} />

//       <label>City</label>
//       <input name="city" value={form.city} onChange={handleChange} />

//       <label>State</label>
//       <input name="state" value={form.state} onChange={handleChange} />

//       <label>Description</label>
//       <textarea name="description" value={form.description} onChange={handleChange} />

//       <label>Add Images</label>
//       <input type="file" multiple accept="image/*" onChange={handleImageChange} />

//       <div className="image-preview-grid">
//         {previewUrls.map((img, i) => (
//           <div key={i} className="preview-box">
//             <img src={img} className="preview-img" />
//             <button type="button" onClick={() => removeNewImage(i)}>✕</button>
//           </div>
//         ))}
//       </div>

//       {isEdit && (
//         <>
//           <h4>Existing Images</h4>
//           <div className="image-preview-grid">
//             {existingImages.map((img, i) => (
//               <div key={i} className="preview-box">
//                 <img alt="Imag" src={img + "?t=" + Date.now()} className="preview-img" />
//                 <button type="button" onClick={() => removeExistingImage(img)}>✕</button>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       <h3>Village Developments</h3>

//       {allDevelopments.map(dev => (
//         <div key={dev.id} className="dev-card">

//           <label className="dev-title">
//             <input
//               type="checkbox"
//               checked={!!selectedDevelopments[dev.id]}
//               onChange={() => toggleDevelopment(dev.id)}
//             />
//             {dev.title}
//           </label>

//           {selectedDevelopments[dev.id] && (
//             <div className="dev-fields">

//               <textarea
//                 placeholder="Work Description"
//                 value={selectedDevelopments[dev.id].workDescription}
//                 onChange={e => updateDevField(dev.id, "workDescription", e.target.value)}
//               />

//               <textarea
//                 placeholder="Benefit"
//                 value={selectedDevelopments[dev.id].benefit}
//                 onChange={e => updateDevField(dev.id, "benefit", e.target.value)}
//               />

//               <label>Progress: {selectedDevelopments[dev.id].progressPercent}%</label>

//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 value={selectedDevelopments[dev.id].progressPercent}
//                 onChange={e => updateDevField(dev.id, "progressPercent", Number(e.target.value))}
//               />

//               <input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={selectedDevelopments[dev.id].progressPercent}
//                 onChange={e => updateDevField(dev.id, "progressPercent", Number(e.target.value))}
//               />

//             </div>
//           )}

//         </div>
//       ))}

//       <div className="form-btn-row">
//         <button className="save-btn" onClick={handleSubmit}>Save</button>
//         <button className="cancel-btn" onClick={() => onClose(null)}>Cancel</button>
//       </div>

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
  assignDevelopmentToVillage,updateVillageDevelopment
} from "./service/villageDevelopmentService";
import { getByPhase } from "./service/developmentservice";
import "./VillageList.css";
import VillageView from "./edit/VillageView";

export default function VillageList() {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [form, setForm] = useState({});
  const [assigned, setAssigned] = useState([]);
  const [phase, setPhase] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [progress, setProgress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [viewVillage, setViewVillage] = useState(null);
  const [editDev, setEditDev] = useState(null);
const [editProgress, setEditProgress] = useState("");
const [editRemarks, setEditRemarks] = useState("");
const [existingImages, setExistingImages] = useState([]);
const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    const res = await getAllVillages();
    setVillages(res.data);
  };

  const handleView = (v) => {
  setViewVillage(v);
};

  // ---------------- EDIT OPEN ----------------
  const handleEdit = async (v) => {
    setSelectedVillage(v);
    setForm({ ...v });
    setSelectedProject(null);
    setProgress("");
    setRemarks("");
    setProjects([]);
    setPhase("");

    if (v.smartGaon) {
      const data = await getVillageDevelopments(v.id);
      setAssigned(data);
    } else {
      setAssigned([]);
    }
  };

  // ---------------- UPDATE ----------------
const handleUpdate = async () => {

  const payload = {
    name: form.name,
    city: form.city,
    state: form.state,
    description: form.description,
    smartGaon: form.smartGaon
  };

  await updateVillage(selectedVillage.id, payload);

  alert("Village Updated Successfully");
  fetchVillages();
  setSelectedVillage(null);
};

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (window.confirm("Delete this village?")) {
      await deleteVillage(id);
      fetchVillages();
    }
  };

  // ---------------- PHASE ----------------
 const handlePhaseChange = async (value) => {
  setPhase(value);

  const res = await getByPhase(value);
  setProjects(res?.data ?? []);

  setSelectedProject(null);
};

  // ---------------- ASSIGN ----------------
  const handleAssign = async () => {
    if (!selectedProject) {
      alert("Select a project");
      return;
    }

    await assignDevelopmentToVillage({
      villageId: selectedVillage.id,
      developmentId: selectedProject.id,
      progress,
      remarks,
    });

    alert("Development Added Successfully");

    const data = await getVillageDevelopments(selectedVillage.id);
    setAssigned(data);

    setSelectedProject(null);
    setProgress("");
    setRemarks("");
  };

  return (
    <div className="village-list-container">
      <h2>All Villages</h2>

      {villages.map((v) => (
        <div key={v.id} className="village-card">
          <h3>
            {v.name}{" "}
            {v.smartGaon && <span className="smart-badge">SMART</span>}
          </h3>
          <p>
            {v.city}, {v.state}
          </p>
          <button onClick={() => handleView(v)}>View</button>
          <button onClick={() => handleEdit(v)}>Edit</button>
          <button onClick={() => handleDelete(v.id)}>Delete</button>
        </div>
      ))}

      {/* ================= MODAL ================= */}
      {selectedVillage && (
        <div className="modal-overlay">
          <div className="modal-box-large">
            <button
              className="close-btn"
              onClick={() => setSelectedVillage(null)}
            >
              ✕
            </button>

            <h3>Edit Village</h3>

            

            <input
              value={form.name || ""}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Village Name"
            />

            <input
              value={form.city || ""}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
              placeholder="City"
            />

            <input
              value={form.state || ""}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
              placeholder="State"
            />

            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
            />

            <label>
              <input
                type="checkbox"
                checked={form.smartGaon || false}
                onChange={(e) =>
                  setForm({ ...form, smartGaon: e.target.checked })
                }
              />
              Is Smart Gaon
            </label>

            <button onClick={handleUpdate}>Update Village</button>

            {/* ===== DEVELOPMENT SECTION ===== */}
            {form.smartGaon && (
              <>
                <hr />
                <h4>Assigned Development</h4>

                {assigned.length === 0 && (
                  <p>No development assigned yet</p>
                )}

                

                {assigned.map((item) => (
  <div
    key={item.id}
    style={{
      border: "1px solid #ddd",
      padding: "12px",
      marginBottom: "10px",
      borderRadius: "8px",
      background: "#f9fafb"
    }}
  >
    <div style={{ fontWeight: "600" }}>
      Phase {item.development.phaseNumber} – {item.development.title}
    </div>

    <div>Progress: {item.progressPercent}%</div>
    <div>Remarks: {item.remarks || "—"}</div>

    <button
      style={{
        marginTop: "8px",
        padding: "5px 12px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
      onClick={() => {
        setEditDev(item);
        setEditProgress(item.progressPercent);
        setEditRemarks(item.remarks || "");
          setExistingImages(item.galleryImages || []);
  setNewImages([]);
      }}
    >
      Edit
    </button>
  </div>
))}
     {editDev && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      background: "#f9fafb"
    }}
  >
    <h4 style={{ marginBottom: "10px" }}>Edit Development</h4>

    {/* Progress */}
    <div style={{ marginBottom: "10px" }}>
      <label>Progress %</label>
      <input
        type="number"
        min="0"
        max="100"
        value={editProgress}
        onChange={(e) => setEditProgress(e.target.value)}
        style={{ width: "100%", padding: "6px", marginTop: "4px" }}
      />
    </div>

    {/* Remarks */}
    <div style={{ marginBottom: "10px" }}>
      <label>Remarks</label>
      <input
        value={editRemarks}
        onChange={(e) => setEditRemarks(e.target.value)}
        style={{ width: "100%", padding: "6px", marginTop: "4px" }}
      />
    </div>

    {/* Existing Images */}
    {existingImages.length > 0 && (
      <>
        <h5>Existing Images</h5>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {existingImages.map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={img}
                alt="gallery"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "6px"
                }}
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  background: "red",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}
                onClick={() =>
                  setExistingImages(
                    existingImages.filter((_, i) => i !== index)
                  )
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Upload New Images */}
    <div style={{ marginTop: "15px" }}>
      <label>Add New Images</label>
      <input
        type="file"
        multiple
        onChange={(e) => setNewImages(Array.from(e.target.files))}
        style={{ display: "block", marginTop: "6px" }}
      />
    </div>

    {/* Buttons Row */}
    <div
      style={{
        marginTop: "15px",
        display: "flex",
        gap: "10px"
      }}
    >
      <button
        style={{
          padding: "8px 14px",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
        onClick={async () => {
          const formData = new FormData();

          formData.append("progress", editProgress);
          formData.append("remarks", editRemarks);

          existingImages.forEach((img) =>
            formData.append("existingImages", img)
          );

          newImages.forEach((img) =>
            formData.append("images", img)
          );

          await updateVillageDevelopment(editDev.id, formData);

          const data = await getVillageDevelopments(selectedVillage.id);
          setAssigned(data);

          setEditDev(null);
          setExistingImages([]);
          setNewImages([]);
        }}
      >
        Update Development
      </button>

      <button
        style={{
          padding: "8px 14px",
          background: "#6b7280",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
        onClick={() => {
          setEditDev(null);
          setExistingImages([]);
          setNewImages([]);
          setEditProgress("");
          setEditRemarks("");
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
                <hr />
                <h4>Add Development</h4>

                <select
                  value={phase}
                  onChange={(e) =>
                    handlePhaseChange(e.target.value)
                  }
                >
                  <option value="">Select Phase</option>
                  <option value="1">Phase 1</option>
                  <option value="2">Phase 2</option>
                  <option value="3">Phase 3</option>
                </select>

                {projects.map((p) => (
                  <div key={p.id}>
                    <input
                      type="radio"
                      name="project"
                      checked={
                        selectedProject?.id === p.id
                      }
                      onChange={() => setSelectedProject(p)}
                    />
                    {p.title}
                  </div>
                ))}

                <input
                  value={progress}
                  placeholder="Progress %"
                  onChange={(e) =>
                    setProgress(e.target.value)
                  }
                />

                <input
                  value={remarks}
                  placeholder="Remarks"
                  onChange={(e) =>
                    setRemarks(e.target.value)
                  }
                />

                <button onClick={handleAssign}>
                  Add Development
                </button>
              </>
            )}
   
          </div>
        </div>
      )}

              
          {viewVillage && (
  <div className="view-overlay">
    <div className="view-box-large">

      <button
        onClick={() => setViewVillage(null)}
        style={{
          position: "absolute",
          top: "18px",
          right: "22px",
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "14px",
          cursor: "pointer"
        }}
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