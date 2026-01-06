
// // import React, { useState } from "react";
// // import { createDonationProject } from "./services/donationService";
// // import "./donation.css";

// // const STATES = [
// //   "BIHAR",
// //   "JHARKHAND",
// //   "UTTAR_PRADESH",
// //   "MAHARASHTRA",
// //   "GUJARAT",
// // ];

// // const CreateProject = () => {
// //   const [form, setForm] = useState({
// //     projectName: "",
// //     description: "",
// //     requiredAmount: "",
// //   });

// //   const [allStates, setAllStates] = useState(false);
// //   const [state, setState] = useState("");
// //   const [pincode, setPincode] = useState("");

// //   const [images, setImages] = useState([]);
// //   const [videos, setVideos] = useState([]);

// //   const submit = async () => {
// //     if (!form.projectName || !form.requiredAmount) {
// //       alert("Project name and required amount are mandatory");
// //       return;
// //     }

// //     if (!allStates && (!state || !pincode)) {
// //       alert("Please select state and pincode");
// //       return;
// //     }

// //     // ✅ FORM DATA
// //     const fd = new FormData();
// //     fd.append("projectName", form.projectName);
// //     fd.append("description", form.description);
// //     fd.append("requiredAmount", form.requiredAmount);
// //     fd.append("allStates", allStates);

// //     if (!allStates) {
// //       fd.append("state", state);
// //       fd.append("pincode", pincode);
// //     }

// //     images.forEach((img) => fd.append("imageFiles", img));
// //     videos.forEach((vid) => fd.append("videoFiles", vid));

// //     await createDonationProject(fd);

// //     alert("Donation Project Created Successfully");

// //     // reset
// //     setForm({ projectName: "", description: "", requiredAmount: "" });
// //     setAllStates(false);
// //     setState("");
// //     setPincode("");
// //     setImages([]);
// //     setVideos([]);
// //   };

// //   return (
// //     <div className="donation-form-card">
// //       <h3 className="donation-subtitle">Create Donation Project</h3>

// //       <div className="donation-form">
// //         <label>Project Name</label>
// //         <input
// //           value={form.projectName}
// //           onChange={(e) =>
// //             setForm({ ...form, projectName: e.target.value })
// //           }
// //         />

// //         <label>Description</label>
// //         <textarea
// //           maxLength={1500}
// //           value={form.description}
// //           onChange={(e) =>
// //             setForm({ ...form, description: e.target.value })
// //           }
// //         />

// //         <label>Required Amount</label>
// //         <input
// //           type="number"
// //           value={form.requiredAmount}
// //           onChange={(e) =>
// //             setForm({ ...form, requiredAmount: e.target.value })
// //           }
// //         />

// //         <label>Project Images</label>
// //         <input
// //           type="file"
// //           multiple
// //           accept="image/*"
// //           onChange={(e) => setImages([...e.target.files])}
// //         />

// //         <label>Project Videos</label>
// //         <input
// //           type="file"
// //           multiple
// //           accept="video/*"
// //           onChange={(e) => setVideos([...e.target.files])}
// //         />

// //         <div className="checkbox-row">
// //           <input
// //             type="checkbox"
// //             checked={allStates}
// //             onChange={() => setAllStates(!allStates)}
// //           />
// //           <label>All States</label>
// //         </div>

// //         {!allStates && (
// //           <>
// //             <select value={state} onChange={(e) => setState(e.target.value)}>
// //               <option value="">Select State</option>
// //               {STATES.map((s) => (
// //                 <option key={s} value={s}>{s}</option>
// //               ))}
// //             </select>

// //             <input
// //               placeholder="Pincode"
// //               value={pincode}
// //               onChange={(e) => setPincode(e.target.value)}
// //             />
// //           </>
// //         )}

// //         <button className="btn-primary" onClick={submit}>
// //           Post Project
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CreateProject;

// import React, { useState } from "react";
// import { createDonationProject } from "./services/donationService";
// import "./donation.css";

// const STATES = ["BIHAR", "JHARKHAND", "UTTAR_PRADESH", "MAHARASHTRA", "GUJARAT"];

// const CreateProject = () => {
//   const [projectName, setProjectName] = useState("");
//   const [description, setDescription] = useState("");
//   const [requiredAmount, setRequiredAmount] = useState("");

//   const [allStates, setAllStates] = useState(false);
//   const [state, setState] = useState("");
//   const [pincode, setPincode] = useState("");

//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);

//   const submit = async () => {
//     const fd = new FormData();

//     fd.append("projectName", projectName);
//     fd.append("description", description);
//     fd.append("requiredAmount", requiredAmount);
//     fd.append("allStates", allStates);

//     if (!allStates) {
//       fd.append("state", state);
//       fd.append("pincode", pincode);
//     }

//     // ✅ CRITICAL: append files correctly
//     for (let i = 0; i < images.length; i++) {
//       fd.append("imageFiles", images[i]);
//     }

//     for (let i = 0; i < videos.length; i++) {
//       fd.append("videoFiles", videos[i]);
//     }

//     await createDonationProject(fd);

//     alert("Project created successfully");
//   };

//   return (
//     <div className="donation-form-card">
//       <h3>Create Donation Project</h3>
//       <label>Project Name</label>
//       <input
//         placeholder="Project Name"
//         value={projectName}
//         onChange={(e) => setProjectName(e.target.value)}
//       />
//      <label>Description</label>
//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />
//       <label>Required Amount</label>
//       <input
//         type="number"
//         placeholder="Required Amount"
//         value={requiredAmount}
//         onChange={(e) => setRequiredAmount(e.target.value)}
//       />

//       {/* ✅ IMAGE INPUT */}
//       <input
//         type="file"
//         multiple
//         accept="image/*"
//         onChange={(e) => setImages(Array.from(e.target.files))}
//       />

//       {/* ✅ VIDEO INPUT */}
//       <input
//         type="file"
//         multiple
//         accept="video/*"
//         onChange={(e) => setVideos(Array.from(e.target.files))}
//       />

//       <label>
//         <input
//           type="checkbox"
//           checked={allStates}
//           onChange={() => setAllStates(!allStates)}
//         />
//         All States
//       </label>

//       {!allStates && (
//         <>
//           <select value={state} onChange={(e) => setState(e.target.value)}>
//             <option value="">Select State</option>
//             {STATES.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>

//           <input
//             placeholder="Pincode"
//             value={pincode}
//             onChange={(e) => setPincode(e.target.value)}
//           />
//         </>
//       )}

//       <button className="btn-primary" onClick={submit}>
//         Create Project
//       </button>
//     </div>
//   );
// };

// export default CreateProject;


import React, { useState } from "react";
import { createDonationProject } from "./services/donationService";
import "./createproject.css";

const STATES = ["BIHAR", "JHARKHAND", "UTTAR_PRADESH", "MAHARASHTRA", "GUJARAT"];

const CreateProject = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredAmount, setRequiredAmount] = useState("");

  const [allStates, setAllStates] = useState(false);
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  // =========================
  // IMAGE HANDLERS
  // =========================
  const addImages = (files) => {
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // =========================
  // VIDEO HANDLERS
  // =========================
  const addVideos = (files) => {
    setVideos((prev) => [...prev, ...Array.from(files)]);
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // =========================
  // SUBMIT
  // =========================
  const submit = async () => {
    if (!projectName || !requiredAmount || images.length === 0) {
      alert("Project name, amount & images are mandatory");
      return;
    }

    const fd = new FormData();
    fd.append("projectName", projectName);
    fd.append("description", description);
    fd.append("requiredAmount", requiredAmount);
    fd.append("allStates", allStates);

    if (!allStates) {
      fd.append("state", state);
      fd.append("pincode", pincode);
    }

    images.forEach((img) => fd.append("imageFiles", img));
    videos.forEach((vid) => fd.append("videoFiles", vid));

    await createDonationProject(fd);
    alert("Project created successfully");
  };

  return (
    <div className="donation-form-card">
      <h3>Create Donation Project</h3>

      <input placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="number" placeholder="Required Amount" value={requiredAmount} onChange={(e) => setRequiredAmount(e.target.value)} />

      {/* ================= IMAGE UPLOAD ================= */}
      <label>Upload Photos</label>
      <div className="upload-box">
        {images.map((img, i) => (
          <div key={i} className="preview">
            <img src={URL.createObjectURL(img)} alt="" />
            <button onClick={() => removeImage(i)}>✕</button>
          </div>
        ))}

        <label className="add-btn">
          +
          <input type="file" hidden multiple accept="image/*" onChange={(e) => addImages(e.target.files)} />
        </label>
      </div>

      {/* ================= VIDEO UPLOAD ================= */}
      <label>Upload Videos (optional)</label>
      <div className="upload-box">
        {videos.map((vid, i) => (
          <div key={i} className="preview video">
            <video src={URL.createObjectURL(vid)} />
            <button onClick={() => removeVideo(i)}>✕</button>
          </div>
        ))}

        <label className="add-btn">
          +
          <input type="file" hidden multiple accept="video/*" onChange={(e) => addVideos(e.target.files)} />
        </label>
      </div>

      <label>
        <input type="checkbox" checked={allStates} onChange={() => setAllStates(!allStates)} /> All States
      </label>

      {!allStates && (
        <>
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select State</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </>
      )}

      <button className="btn-primary" onClick={submit}>Create Project</button>
    </div>
  );
};

export default CreateProject;
