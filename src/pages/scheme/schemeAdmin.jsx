// import React, { useEffect, useState } from "react";
// import {
//   createScheme,
//   getAllSchemes,
//   updateScheme,
//   deleteScheme,
// } from "./schemeService";
// import { getCategories, createCategory } from "./categoryService";
// import ReactDOM from "react-dom";
// import "./SchemeAdmin.css";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { db } from "../../firebase";

// const SchemeAdmin = () => {

//   const role = localStorage.getItem("adminRole");
//   const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   const [schemes, setSchemes] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [showSchemeModal, setShowSchemeModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [expandedTitles, setExpandedTitles] = useState({});

//   const toggleTitle = (id) => {
//     setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const [editingScheme, setEditingScheme] = useState(null);
//   const [selectedScheme, setSelectedScheme] = useState(null);

//   const [formData, setFormData] = useState({
//     schemeType: "CENTRAL",
//     categoryId: "",
//     state: "",
//     title: "",
//     detail: "",
//     benefits: "",
//     eligibility: "",
//     schemeUrl: "",
//     image: null,
//   });

//   const [newCategory, setNewCategory] = useState("");

//   useEffect(() => {
//     loadSchemes();
//     loadCategories();
//   }, []);

//   const loadSchemes = async () => {
//     const res = await getAllSchemes();
//     setSchemes(res.data || []);
//   };

//   const loadCategories = async () => {
//     const res = await getCategories();
//     setCategories(res.data || []);
//   };

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "schemeType" && value === "CENTRAL") {
//       setFormData((p) => ({ ...p, schemeType: value, state: "" }));
//       return;
//     }
//     setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));
//   };

//   const resetForm = () => {
//     setFormData({
//       schemeType: "CENTRAL",
//       categoryId: "",
//       state: "",
//       title: "",
//       detail: "",
//       benefits: "",
//       eligibility: "",
//       schemeUrl: "",
//       image: null,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!canManage) return;

//     if (formData.schemeType === "STATE" && !formData.state) {
//       alert("Please select a state");
//       return;
//     }

//     const data = new FormData();
//     Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));

//     if (editingScheme) {
//       await updateScheme(editingScheme.id, data);
//       alert("Scheme Updated");
//     } else {
//       await createScheme(data);
//       alert("Scheme Created");

//        await addDoc(collection(db, "notifications"), {
//     title: "New Government Scheme",
//     message: formData.title,
//     type: "scheme",
//     createdAt: serverTimestamp(),
//   });

//     }

//     setShowSchemeModal(false);
//     setEditingScheme(null);
//     resetForm();
//     loadSchemes();
//   };

//   const handleEdit = (scheme) => {
//     if (!canManage) return;
//     setEditingScheme(scheme);
//     setFormData({
//       schemeType: scheme.schemeType,
//       categoryId: scheme.category?.id || "",
//       state: scheme.state || "",
//       title: scheme.title,
//       detail: scheme.detail,
//       benefits: scheme.benefits,
//       eligibility: scheme.eligibility,
//       schemeUrl: scheme.schemeUrl,
//       image: null,
//     });
//     setShowSchemeModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (!canManage) return;
//     if (window.confirm("Delete this scheme?")) {
//       await deleteScheme(id);
//       loadSchemes();
//     }
//   };

//   return (
//     <div className="scheme-container">

//       {/* ── HEADER ── */}
//       <div className="scheme-header">
//         <h2>Government Schemes</h2>

//         {canManage && (
//           <div style={{ display: "flex", gap: "10px" }}>
//             <button
//               onClick={() => setShowCategoryModal(true)}
//               style={{
//                 padding: "8px 16px", border: "none", borderRadius: "6px",
//                 cursor: "pointer", fontSize: "14px", fontWeight: "600",
//                 backgroundColor: "#1976d2", color: "white", whiteSpace: "nowrap",
//               }}
//             >
//               Create Category
//             </button>
//             <button
//               onClick={() => setShowSchemeModal(true)}
//               style={{
//                 padding: "8px 16px", border: "none", borderRadius: "6px",
//                 cursor: "pointer", fontSize: "14px", fontWeight: "600",
//                 backgroundColor: "#2e7d32", color: "white", whiteSpace: "nowrap",
//               }}
//             >
//               Create Scheme
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ── TABLE ── */}
//       <table className="scheme-table">
//         <thead>
//           <tr>
//             <th>Title</th>
//             <th>Type</th>
//             <th>State</th>
//             <th>Category</th>
//             {canManage && <th>Actions</th>}
//           </tr>
//         </thead>

//         <tbody>
//           {schemes.map((s) => (
//             <tr key={s.id}>
//               <td>
//                 {expandedTitles[s.id]
//                   ? s.title
//                   : s.title.split(" ").slice(0, 4).join(" ") +
//                     (s.title.split(" ").length > 4 ? "..." : "")}

//                 {s.title.split(" ").length > 4 && (
//                   <span
//                     onClick={() => toggleTitle(s.id)}
//                     style={{ color: "blue", cursor: "pointer", marginLeft: "6px", fontSize: "13px" }}
//                   >
//                     {expandedTitles[s.id] ? "View Less" : "View More"}
//                   </span>
//                 )}
//               </td>

//               <td>{s.schemeType}</td>
//               <td>{s.state || "-"}</td>
//               <td>{s.category?.name}</td>

//               {canManage && (
//                 <td>
//                   <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//                     <button
//                       onClick={() => { setSelectedScheme(s); setShowDetailModal(true); }}
//                       style={{
//                         padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
//                         border: "none", cursor: "pointer", fontWeight: "600",
//                         backgroundColor: "#6c757d", color: "#fff", minWidth: "65px",
//                       }}
//                     >
//                       View
//                     </button>

//                     <button
//                       onClick={() => handleEdit(s)}
//                       style={{
//                         padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
//                         border: "none", cursor: "pointer", fontWeight: "600",
//                         backgroundColor: "#2ecc71", color: "#fff", minWidth: "65px",
//                       }}
//                     >
//                       Edit
//                     </button>

//                     <button
//                       onClick={() => handleDelete(s.id)}
//                       style={{
//                         padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
//                         border: "none", cursor: "pointer", fontWeight: "600",
//                         backgroundColor: "#e74c3c", color: "#fff", minWidth: "65px",
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>


//       {/* ── STEP 3: DETAILS MODAL — rendered on document.body ── */}
//       {showDetailModal && selectedScheme && ReactDOM.createPortal(
//         <div className="scheme-details-overlay">
//           <div className="scheme-details-modal">
//             <button className="scheme-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
//             <h3>{selectedScheme.title}</h3>
//             <div className="details-content">
//               <p><strong>Type:</strong> {selectedScheme.schemeType}</p>
//               <p><strong>State:</strong> {selectedScheme.state || "N/A"}</p>
//               <p><strong>Category:</strong> {selectedScheme.category?.name}</p>
//               <p><strong>Description:</strong> {selectedScheme.detail}</p>
//               <p><strong>Benefits:</strong> {selectedScheme.benefits}</p>
//               <p><strong>Eligibility:</strong> {selectedScheme.eligibility}</p>
//             </div>
//           </div>
//         </div>,
//         document.body
//       )}


//       {/* ── STEP 4: CREATE / EDIT SCHEME MODAL — rendered on document.body ── */}
//       {canManage && showSchemeModal && ReactDOM.createPortal(
//         <div className="scheme-form-overlay">
//           <div className="scheme-form-modal">
//             <button className="scheme-modal-close" onClick={() => { setShowSchemeModal(false); setEditingScheme(null); resetForm(); }}>✕</button>
//             <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

//             <form onSubmit={handleSubmit} className="scheme-form">
//               <div className="form-grid">

//                 <select name="schemeType" value={formData.schemeType} onChange={handleChange}>
//                   <option value="CENTRAL">Central</option>
//                   <option value="STATE">State</option>
//                 </select>

//                 <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
//                   <option value="">Select Category</option>
//                   {categories.map((c) => (
//                     <option key={c.id} value={c.id}>{c.name}</option>
//                   ))}
//                 </select>

//                 {formData.schemeType === "STATE" && (
//                   <select name="state" value={formData.state} onChange={handleChange} required>
//                     <option value="">Select State</option>
//                     <option value="BIHAR">Bihar</option>
//                     <option value="UTTAR_PRADESH">Uttar Pradesh</option>
//                     <option value="GUJARAT">Gujarat</option>
//                     <option value="MAHARASHTRA">Maharashtra</option>
//                     <option value="JHARKHAND">Jharkhand</option>
//                   </select>
//                 )}

//                 <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
//                 <textarea name="detail" value={formData.detail} onChange={handleChange} placeholder="Description" />
//                 <textarea name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Benefits" />
//                 <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Eligibility" />
//                 <input name="schemeUrl" value={formData.schemeUrl} onChange={handleChange} placeholder="URL" />
//                 <input type="file" name="image" onChange={handleChange} />

//               </div>

//               <div className="form-footer">
//                 <button type="submit">
//                   {editingScheme ? "Update Scheme" : "Save Scheme"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>,
//         document.body
//       )}


//       {/* ── STEP 5: CREATE CATEGORY MODAL — rendered on document.body ── */}
//       {canManage && showCategoryModal && ReactDOM.createPortal(
//         <div className="scheme-modal">
//           <div className="scheme-modal-box">
//             <button className="scheme-close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
//             <h3>Create Category</h3>

//             <input
//               placeholder="Category name"
//               value={newCategory}
//               onChange={(e) => setNewCategory(e.target.value)}
//             />

//             <button
//               onClick={async () => {
//                 if (!newCategory.trim()) return;
//                 await createCategory(newCategory);
//                 alert("Category created");
//                 setNewCategory("");
//                 loadCategories();
//                 setShowCategoryModal(false);
//               }}
//             >
//               Add Category
//             </button>
//           </div>
//         </div>,
//         document.body
//       )}

//     </div>
//   );
// };

// export default SchemeAdmin;


import React, { useEffect, useState } from "react";
import {
  createScheme,
  getAllSchemes,
  updateScheme,
  deleteScheme,
} from "./schemeService";
import { getCategories, createCategory } from "./categoryService";
import ReactDOM from "react-dom";
import "./SchemeAdmin.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const SchemeAdmin = ({ onClose }) => {   {/* ← accept onClose prop */}

  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState({});

  const toggleTitle = (id) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [editingScheme, setEditingScheme] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [formData, setFormData] = useState({
    schemeType: "CENTRAL",
    categoryId: "",
    state: "",
    title: "",
    detail: "",
    benefits: "",
    eligibility: "",
    schemeUrl: "",
    image: null,
  });

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    loadSchemes();
    loadCategories();
  }, []);

  const loadSchemes = async () => {
    const res = await getAllSchemes();
    setSchemes(res.data || []);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data || []);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "schemeType" && value === "CENTRAL") {
      setFormData((p) => ({ ...p, schemeType: value, state: "" }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: files ? files[0] : value }));
  };

  const resetForm = () => {
    setFormData({
      schemeType: "CENTRAL",
      categoryId: "",
      state: "",
      title: "",
      detail: "",
      benefits: "",
      eligibility: "",
      schemeUrl: "",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;

    if (formData.schemeType === "STATE" && !formData.state) {
      alert("Please select a state");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));

    if (editingScheme) {
      await updateScheme(editingScheme.id, data);
      alert("Scheme Updated");
    } else {
      await createScheme(data);
      alert("Scheme Created");

      await addDoc(collection(db, "notifications"), {
        title: "New Government Scheme",
        message: formData.title,
        type: "scheme",
        createdAt: serverTimestamp(),
      });
    }

    setShowSchemeModal(false);
    setEditingScheme(null);
    resetForm();
    loadSchemes();
  };

  const handleEdit = (scheme) => {
    if (!canManage) return;
    setEditingScheme(scheme);
    setFormData({
      schemeType: scheme.schemeType,
      categoryId: scheme.category?.id || "",
      state: scheme.state || "",
      title: scheme.title,
      detail: scheme.detail,
      benefits: scheme.benefits,
      eligibility: scheme.eligibility,
      schemeUrl: scheme.schemeUrl,
      image: null,
    });
    setShowSchemeModal(true);
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (window.confirm("Delete this scheme?")) {
      await deleteScheme(id);
      loadSchemes();
    }
  };

  return (
    <div className="scheme-container">

      {/* ── HEADER ── */}
      <div className="scheme-header">
        <h2>Government Schemes</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {canManage && (
            <>
              <button
                onClick={() => setShowCategoryModal(true)}
                style={{
                  padding: "8px 16px", border: "none", borderRadius: "6px",
                  cursor: "pointer", fontSize: "14px", fontWeight: "600",
                  backgroundColor: "#1976d2", color: "white", whiteSpace: "nowrap",
                }}
              >
                Create Category
              </button>
              <button
                onClick={() => setShowSchemeModal(true)}
                style={{
                  padding: "8px 16px", border: "none", borderRadius: "6px",
                  cursor: "pointer", fontSize: "14px", fontWeight: "600",
                  backgroundColor: "#2e7d32", color: "white", whiteSpace: "nowrap",
                }}
              >
                Create Scheme
              </button>
            </>
          )}

          {/* ── CLOSE BUTTON ── */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                padding: "6px 12px", border: "none", borderRadius: "6px",
                cursor: "pointer", fontSize: "18px", fontWeight: "700",
                backgroundColor: "#f0f0f0", color: "#333", lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <table className="scheme-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>State</th>
            <th>Category</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {schemes.map((s) => (
            <tr key={s.id}>
              <td>
                {expandedTitles[s.id]
                  ? s.title
                  : s.title.split(" ").slice(0, 4).join(" ") +
                    (s.title.split(" ").length > 4 ? "..." : "")}

                {s.title.split(" ").length > 4 && (
                  <span
                    onClick={() => toggleTitle(s.id)}
                    style={{ color: "blue", cursor: "pointer", marginLeft: "6px", fontSize: "13px" }}
                  >
                    {expandedTitles[s.id] ? "View Less" : "View More"}
                  </span>
                )}
              </td>

              <td>{s.schemeType}</td>
              <td>{s.state || "-"}</td>
              <td>{s.category?.name}</td>

              {canManage && (
                <td>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => { setSelectedScheme(s); setShowDetailModal(true); }}
                      style={{
                        padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
                        border: "none", cursor: "pointer", fontWeight: "600",
                        backgroundColor: "#6c757d", color: "#fff", minWidth: "65px",
                      }}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEdit(s)}
                      style={{
                        padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
                        border: "none", cursor: "pointer", fontWeight: "600",
                        backgroundColor: "#2ecc71", color: "#fff", minWidth: "65px",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        padding: "6px 14px", fontSize: "13px", borderRadius: "6px",
                        border: "none", cursor: "pointer", fontWeight: "600",
                        backgroundColor: "#e74c3c", color: "#fff", minWidth: "65px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── DETAILS MODAL ── */}
      {showDetailModal && selectedScheme && ReactDOM.createPortal(
        <div className="scheme-details-overlay">
          <div className="scheme-details-modal">
            <button className="scheme-modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            <h3>{selectedScheme.title}</h3>
            <div className="details-content">
              <p><strong>Type:</strong> {selectedScheme.schemeType}</p>
              <p><strong>State:</strong> {selectedScheme.state || "N/A"}</p>
              <p><strong>Category:</strong> {selectedScheme.category?.name}</p>
              <p><strong>Description:</strong> {selectedScheme.detail}</p>
              <p><strong>Benefits:</strong> {selectedScheme.benefits}</p>
              <p><strong>Eligibility:</strong> {selectedScheme.eligibility}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE / EDIT SCHEME MODAL ── */}
      {canManage && showSchemeModal && ReactDOM.createPortal(
        <div className="scheme-form-overlay">
          <div className="scheme-form-modal">
            <button className="scheme-modal-close" onClick={() => { setShowSchemeModal(false); setEditingScheme(null); resetForm(); }}>✕</button>
            <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

            <form onSubmit={handleSubmit} className="scheme-form">
              <div className="form-grid">

                <select name="schemeType" value={formData.schemeType} onChange={handleChange}>
                  <option value="CENTRAL">Central</option>
                  <option value="STATE">State</option>
                </select>

                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {formData.schemeType === "STATE" && (
                  <select name="state" value={formData.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    <option value="BIHAR">Bihar</option>
                    <option value="UTTAR_PRADESH">Uttar Pradesh</option>
                    <option value="GUJARAT">Gujarat</option>
                    <option value="MAHARASHTRA">Maharashtra</option>
                    <option value="JHARKHAND">Jharkhand</option>
                  </select>
                )}

                <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
                <textarea name="detail" value={formData.detail} onChange={handleChange} placeholder="Description" />
                <textarea name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Benefits" />
                <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Eligibility" />
                <input name="schemeUrl" value={formData.schemeUrl} onChange={handleChange} placeholder="URL" />
                <input type="file" name="image" onChange={handleChange} />

              </div>

              <div className="form-footer">
                <button type="submit">
                  {editingScheme ? "Update Scheme" : "Save Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE CATEGORY MODAL ── */}
      {canManage && showCategoryModal && ReactDOM.createPortal(
        <div className="scheme-modal">
          <div className="scheme-modal-box">
            <button className="scheme-close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
            <h3>Create Category</h3>

            <input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              onClick={async () => {
                if (!newCategory.trim()) return;
                await createCategory(newCategory);
                alert("Category created");
                setNewCategory("");
                loadCategories();
                setShowCategoryModal(false);
              }}
            >
              Add Category
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default SchemeAdmin;
