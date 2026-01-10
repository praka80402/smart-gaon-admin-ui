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
  const [editingScheme, setEditingScheme] = useState(null);

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
      setFormData({ ...formData, schemeType: value, state: "" });
      return;
    }

    setFormData({ ...formData, [name]: files ? files[0] : value });
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

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v) data.append(k, v);
    });

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

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory(newCategory);
    setNewCategory("");
    loadCategories();
  };

  return (
    <div className="scheme-container">
      {/* HEADER */}
      <div className="scheme-header">
        <h2>Government Schemes</h2>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => setShowCategoryModal(true)}>
            Create Category
          </button>
          <button className="primary-btn" onClick={() => setShowSchemeModal(true)}>
            Create Scheme
          </button>
        </div>
      </div>

      {/* SCHEME LIST */}
      <div className="scheme-grid">
        {schemes.map((s) => (
          <div key={s.id} className="scheme-card">
            <h3>{s.title}</h3>
            <span className="badge">{s.schemeType}</span>

            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
              <button className="delete-btn" onClick={() => deleteScheme(s.id).then(loadSchemes)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CREATE / EDIT SCHEME MODAL ================= */}
      {showSchemeModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <button className="close-btn" onClick={() => setShowSchemeModal(false)}>✕</button>

            <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

            <form onSubmit={handleSubmit} className="modal-form">
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
                  <option value="UTTAR_PRADESH">Uttar Pradesh</option>
                  <option value="BIHAR">Bihar</option>
                  <option value="GUJARAT">Gujarat</option>
                  <option value="MAHARASHTRA">Maharashtra</option>
                  <option value="JHARKHAND">Jharkhand</option>
                </select>
              )}

              <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
              <textarea name="detail" placeholder="Description" value={formData.detail} onChange={handleChange} />
              <textarea name="benefits" placeholder="Benefits" value={formData.benefits} onChange={handleChange} />
              <textarea name="eligibility" placeholder="Eligibility" value={formData.eligibility} onChange={handleChange} />
              <input name="schemeUrl" placeholder="Official URL" value={formData.schemeUrl} onChange={handleChange} />
              <input type="file" name="image" onChange={handleChange} />

              <button type="submit" className="save-btn">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
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

            <button className="save-btn" onClick={handleCreateCategory}>
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
