// import React, { useEffect, useState } from "react";
// import {
//   createScheme,
//   getAllSchemes,
//   updateScheme,
//   deleteScheme,
// } from "./schemeService";
// import { getCategories, createCategory } from "./categoryService";
// import "./SchemeAdmin.css";

// const SchemeAdmin = () => {
//   const [schemes, setSchemes] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [showSchemeModal, setShowSchemeModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [editingScheme, setEditingScheme] = useState(null);

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
//     setSchemes(res.data);
//   };

//   const loadCategories = async () => {
//     const res = await getCategories();
//     setCategories(res.data);
//   };

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "schemeType" && value === "CENTRAL") {
//       setFormData({ ...formData, schemeType: value, state: "" });
//       return;
//     }

//     setFormData({ ...formData, [name]: files ? files[0] : value });
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

//     const data = new FormData();
//     Object.entries(formData).forEach(([k, v]) => {
//       if (v) data.append(k, v);
//     });

//     if (editingScheme) {
//       await updateScheme(editingScheme.id, data);
//       alert("Scheme Updated");
//     } else {
//       await createScheme(data);
//       alert("Scheme Created");
//     }

//     setShowSchemeModal(false);
//     setEditingScheme(null);
//     resetForm();
//     loadSchemes();
//   };

//   const handleEdit = (scheme) => {
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

//   const handleCreateCategory = async () => {
//     if (!newCategory.trim()) return;
//     await createCategory(newCategory);
//     setNewCategory("");
//     loadCategories();
//   };

//   return (
//     <div className="scheme-container">
//       {/* HEADER */}
//       <div className="scheme-header">
//         <h2>Government Schemes</h2>
//         <div className="header-actions">
//           <button className="secondary-btn" onClick={() => setShowCategoryModal(true)}>
//             Create Category
//           </button>
//           <button className="primary-btn" onClick={() => setShowSchemeModal(true)}>
//             Create Scheme
//           </button>
//         </div>
//       </div>

//       {/* SCHEME LIST */}
//       <div className="scheme-grid">
//         {schemes.map((s) => (
//           <div key={s.id} className="scheme-card">
//             <h3>{s.title}</h3>
//             <span className="badge">{s.schemeType}</span>

//             <div className="card-actions">
//               <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
//               <button className="delete-btn" onClick={() => deleteScheme(s.id).then(loadSchemes)}>Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= CREATE / EDIT SCHEME MODAL ================= */}
//       {showSchemeModal && (
//         <div className="modal-overlay">
//           <div className="modal-box">

//             <button className="close-btn" onClick={() => setShowSchemeModal(false)}>✕</button>

//             <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

//             <form onSubmit={handleSubmit} className="modal-form">
//               <select name="schemeType" value={formData.schemeType} onChange={handleChange}>
//                 <option value="CENTRAL">Central</option>
//                 <option value="STATE">State</option>
//               </select>

//               <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
//                 <option value="">Select Category</option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>

//               {formData.schemeType === "STATE" && (
//                 <select name="state" value={formData.state} onChange={handleChange} required>
//                   <option value="">Select State</option>
//                   <option value="UTTAR_PRADESH">Uttar Pradesh</option>
//                   <option value="BIHAR">Bihar</option>
//                   <option value="GUJARAT">Gujarat</option>
//                   <option value="MAHARASHTRA">Maharashtra</option>
//                   <option value="JHARKHAND">Jharkhand</option>
//                 </select>
//               )}

//               <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
//               <textarea name="detail" placeholder="Description" value={formData.detail} onChange={handleChange} />
//               <textarea name="benefits" placeholder="Benefits" value={formData.benefits} onChange={handleChange} />
//               <textarea name="eligibility" placeholder="Eligibility" value={formData.eligibility} onChange={handleChange} />
//               <input name="schemeUrl" placeholder="Official URL" value={formData.schemeUrl} onChange={handleChange} />
//               <input type="file" name="image" onChange={handleChange} />

//               <button type="submit" className="save-btn">Save</button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= CATEGORY MODAL ================= */}
//       {showCategoryModal && (
//         <div className="modal-overlay">
//           <div className="modal-box">

//             <button className="close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>

//             <h3>Create Category</h3>

//             <input
//               placeholder="Category name"
//               value={newCategory}
//               onChange={(e) => setNewCategory(e.target.value)}
//             />

//             <button className="save-btn" onClick={handleCreateCategory}>
//               Add Category
//             </button>

//             <ul className="category-list">
//               {categories.map((c) => (
//                 <li key={c.id}>{c.name}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
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
import "./SchemeAdmin.css";

const SchemeAdmin = () => {
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    setSchemes(res.data);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "schemeType" && value === "CENTRAL") {
      setFormData((p) => ({ ...p, schemeType: value, state: "" }));
      return;
    }

    setFormData((p) => ({
      ...p,
      [name]: files ? files[0] : value,
    }));
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
    }

    setShowSchemeModal(false);
    setEditingScheme(null);
    resetForm();
    loadSchemes();
  };

  const handleEdit = (scheme) => {
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
    if (window.confirm("Delete this scheme?")) {
      await deleteScheme(id);
      loadSchemes();
    }
  };

  return (
    <div className="scheme-container">
      {/* HEADER */}
      <div className="scheme-header">
        <h2>Government Schemes</h2>
        <div className="header-actions">
          <button onClick={() => setShowCategoryModal(true)}>
            Create Category
          </button>
          <button onClick={() => setShowSchemeModal(true)}>
            Create Scheme
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="scheme-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>State</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schemes.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.schemeType}</td>
              <td>{s.state || "-"}</td>
              <td>{s.category?.name}</td>
              <td className="actions">
                <button onClick={() => { setSelectedScheme(s); setShowDetailModal(true); }}>
                  Details
                </button>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DETAILS MODAL */}
      {showDetailModal && selectedScheme && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            <h3>{selectedScheme.title}</h3>
            <p><b>Type:</b> {selectedScheme.schemeType}</p>
            <p><b>State:</b> {selectedScheme.state || "N/A"}</p>
            <p><b>Category:</b> {selectedScheme.category?.name}</p>
            <p><b>Description:</b> {selectedScheme.detail}</p>
            <p><b>Benefits:</b> {selectedScheme.benefits}</p>
            <p><b>Eligibility:</b> {selectedScheme.eligibility}</p>
            <p>
              <b>URL:</b>{" "}
              <a href={selectedScheme.schemeUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </p>

            <div className="actions">
              <button onClick={() => { setShowDetailModal(false); handleEdit(selectedScheme); }}>
                Edit
              </button>
              <button onClick={() => handleDelete(selectedScheme.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SCHEME MODAL */}
      {showSchemeModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setShowSchemeModal(false)}>✕</button>
            <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

            <form onSubmit={handleSubmit}>
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

              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
            <h3>Create Category</h3>

            <input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              onClick={async () => {
                if (!newCategory.trim()) return;
                try {
                  await createCategory(newCategory);
                  alert("Category created");
                  setNewCategory("");
                  loadCategories();
                  setShowCategoryModal(false);
                } catch (e) {
                  alert(e.response?.data || "Category already exists");
                }
              }}
            >
              Add Category
            </button>

            <ul className="category-list">
              {categories.map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeAdmin;
