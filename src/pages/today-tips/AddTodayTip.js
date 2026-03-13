import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

import "./addtips.css";


export default function AddTodayTip({ onSuccess, initialData = null, docId = null }) {
  const [title, setTitle] = useState("");
  const [occupation, setOccupation] = useState(""); // UPDATED: category → occupation
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 300 * 1024; // 300 KB

  const formatDateDDMMYYYY = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const parseDateToISO = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [d, m, y] = ddmmyyyy.split("-");
    return `${y}-${m}-${d}`;
  };

  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
        
    const cat = initialData.category;
    setOccupation(cat === "ALL" ? "ALL" : cat || "");
      // setOccupation(initialData.category || ""); // UPDATED
      setDescription(initialData.description || "");
      setDate(initialData.date ? parseDateToISO(initialData.date) : "");
      setImageBase64(initialData.imageBase64 || "");
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!title || !occupation || !date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    let finalImage = imageBase64;
    if (imageFile) finalImage = await toBase64(imageFile);

    const payload = {
      title,
      category: occupation, // UPDATED
      description,
      imageBase64: finalImage,
      date: formatDateDDMMYYYY(date),
      notify: true
    };

    // if (docId) {
    //   await updateDoc(doc(db, "today_tips", docId), {
    //     ...payload,
    //     updatedAt: serverTimestamp(),
    //   });
    // } else {
    //   await addDoc(collection(db, "today_tips"), {
    //     ...payload,
    //     createdAt: serverTimestamp(),
    //   });

      
    // }
    if (docId) {
  await updateDoc(doc(db, "today_tips", docId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
} else {
  const tipRef = await addDoc(collection(db, "today_tips"), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  // 🔔 Add notification document
  await addDoc(collection(db, "notifications"), {
    title: "New Today Tip",
    message: title,
    type: "today_tip",
    refId: tipRef.id,
    createdAt: serverTimestamp(),
  });
}

    setLoading(false);
    onSuccess();
  };
return (
  <div className="tip-form-container">

    <h2 className="tip-form-title">
      {docId ? "Edit Today Tip" : "Add Today Tip"}
    </h2>

    <div className="tip-form-group">
      <label>Date</label>
      <input
        type="date"
        className="tip-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>

    <div className="tip-form-group">
      <label>Title</label>
      <input
        type="text"
        className="tip-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter tip title"
      />
    </div>

    <div className="tip-form-group">
      <label>Occupation</label>
      <select
        className="tip-input"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
      >
        <option value="">Select Occupation</option>
        <option value="ALL">All</option>
        <option value="Citizen">Citizen</option>
        <option value="Farmer">Farmer</option>
        <option value="Vendor">Vendor</option>
        <option value="Teacher">Teacher</option>
        <option value="Electrician">Electrician</option>
      </select>
    </div>

    <div className="tip-form-group">
      <label>Description</label>
      <textarea
        className="tip-input tip-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Write description..."
      />
    </div>

    {imageBase64 && !imageFile && (
      <div className="tip-preview-block">
        <label>Current Image</label>
        <img src={imageBase64} alt="preview" className="tip-preview-img" />
      </div>
    )}

    <div className="tip-form-group">
      <label>Upload Image</label>

      <label className="tip-upload-box">
        <input
          type="file"
          accept="image/*"
          className="tip-hidden-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > MAX_FILE_SIZE) {
              alert("Image too large! Max allowed size is 300 KB.");
              e.target.value = "";
              return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = () => setImageBase64(reader.result);
            reader.readAsDataURL(file);
          }}
        />
        Click to upload image (Max 300KB)
      </label>

      {imageBase64 && imageFile && (
        <img src={imageBase64} className="tip-preview-img" alt="preview" />
      )}
    </div>

    <button
      className="tip-save-btn"
      disabled={loading}
      onClick={handleSave}
    >
      {loading ? "Saving..." : docId ? "Update Tip" : "Save Tip"}
    </button>


    </div>
  );
}

// import { useEffect, useState } from "react";
// import {
//   addDoc,
//   collection,
//   serverTimestamp,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../../firebase";

// export default function AddTodayTip({
//   onSuccess,
//   onClose,
//   initialData = null,
//   docId = null,
// }) {
//   const [title, setTitle] = useState("");
//   const [occupation, setOccupation] = useState("");
//   const [description, setDescription] = useState("");
//   const [date, setDate] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imageBase64, setImageBase64] = useState("");
//   const [loading, setLoading] = useState(false);

//   const MAX_FILE_SIZE = 300 * 1024;

//   const formatDateDDMMYYYY = (iso) => {
//     if (!iso) return "";
//     const [y, m, d] = iso.split("-");
//     return `${d}-${m}-${y}`;
//   };

//   const parseDateToISO = (ddmmyyyy) => {
//     if (!ddmmyyyy) return "";
//     const [d, m, y] = ddmmyyyy.split("-");
//     return `${y}-${m}-${d}`;
//   };

//   const toBase64 = (file) =>
//     new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result);
//       reader.readAsDataURL(file);
//     });

//   useEffect(() => {
//     if (initialData) {
//       setTitle(initialData.title || "");
//       const cat = initialData.category;
//       setOccupation(cat === "ALL" ? "ALL" : cat || "");
//       setDescription(initialData.description || "");
//       setDate(initialData.date ? parseDateToISO(initialData.date) : "");
//       setImageBase64(initialData.imageBase64 || "");
//     }
//   }, [initialData]);

//   const handleSave = async () => {
//     if (!title || !occupation || !date) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setLoading(true);

//     let finalImage = imageBase64;
//     if (imageFile) finalImage = await toBase64(imageFile);

//     const payload = {
//       title,
//       category: occupation,
//       description,
//       imageBase64: finalImage,
//       date: formatDateDDMMYYYY(date),
//       notify: true,
//     };

//     if (docId) {
//       await updateDoc(doc(db, "today_tips", docId), {
//         ...payload,
//         updatedAt: serverTimestamp(),
//       });
//     } else {
//       const tipRef = await addDoc(collection(db, "today_tips"), {
//         ...payload,
//         createdAt: serverTimestamp(),
//       });

//       await addDoc(collection(db, "notifications"), {
//         title: "New Today Tip",
//         message: title,
//         type: "today_tip",
//         refId: tipRef.id,
//         createdAt: serverTimestamp(),
//       });
//     }

//     setLoading(false);
//     onSuccess();
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         background: "rgba(0,0,0,0.35)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         zIndex: 9999,
//       }}
//     >
//       <div
//         style={{
//           width: "95%",
//           maxWidth: "650px",
//           background: "#fff",
//           borderRadius: "12px",
//           padding: "30px",
//           position: "relative",
//           maxHeight: "90vh",
//           overflowY: "auto",
//         }}
//       >
//         {/* CLOSE BUTTON */}
//         <button
//           onClick={onClose}
//           style={{
//             position: "absolute",
//             top: "10px",
//             right: "15px",
//             border: "none",
//             background: "transparent",
//             fontSize: "22px",
//             cursor: "pointer",
//             fontWeight: "bold",
//           }}
//         >
//           ×
//         </button>

//         <h2 style={{ marginBottom: "20px" }}>
//           {docId ? "Edit Today Tip" : "Add Today Tip"}
//         </h2>

//         <label>Date</label>
//         <input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "15px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//           }}
//         />

//         <label>Title</label>
//         <input
//           type="text"
//           placeholder="Enter tip title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "15px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//           }}
//         />

//         <label>Occupation</label>
//         <select
//           value={occupation}
//           onChange={(e) => setOccupation(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "15px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//           }}
//         >
//           <option value="">Select Occupation</option>
//           <option value="ALL">All</option>
//           <option value="Citizen">Citizen</option>
//           <option value="Farmer">Farmer</option>
//           <option value="Vendor">Vendor</option>
//           <option value="Teacher">Teacher</option>
//           <option value="Electrician">Electrician</option>
//         </select>

//         <label>Description</label>
//         <textarea
//           value={description}
//           placeholder="Write description..."
//           onChange={(e) => setDescription(e.target.value)}
//           style={{
//             width: "100%",
//             padding: "10px",
//             marginBottom: "15px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             minHeight: "90px",
//           }}
//         />

//         {imageBase64 && (
//           <img
//             src={imageBase64}
//             alt="preview"
//             style={{
//               width: "220px",
//               height: "130px",
//               objectFit: "cover",
//               borderRadius: "6px",
//               marginBottom: "10px",
//             }}
//           />
//         )}

//         <label>Upload Image</label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => {
//             const file = e.target.files?.[0];
//             if (!file) return;

//             if (file.size > MAX_FILE_SIZE) {
//               alert("Image too large! Max allowed size is 300 KB.");
//               e.target.value = "";
//               return;
//             }

//             setImageFile(file);

//             const reader = new FileReader();
//             reader.onload = () => setImageBase64(reader.result);
//             reader.readAsDataURL(file);
//           }}
//           style={{ marginBottom: "15px" }}
//         />

//         <button
//           onClick={handleSave}
//           disabled={loading}
//           style={{
//             width: "100%",
//             padding: "12px",
//             background: "#2563eb",
//             color: "#fff",
//             border: "none",
//             borderRadius: "8px",
//             fontSize: "15px",
//             fontWeight: "600",
//             cursor: "pointer",
//           }}
//         >
//           {loading ? "Saving..." : docId ? "Update Tip" : "Save Tip"}
//         </button>
//       </div>
//     </div>
//   );
// }