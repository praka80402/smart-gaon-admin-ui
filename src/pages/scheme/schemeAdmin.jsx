import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "./categoryService";

import {
  createScheme,
  deleteScheme,
  getAllSchemes,
  updateScheme
} from "./schemeService";

import "./SchemeAdmin.css";

const ITEMS_PER_PAGE = 5;

  const SchemeAdmin = ({ onClose }) => {
  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";


  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterState, setFilterState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [editingScheme, setEditingScheme] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
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

  useEffect(() => {
    loadSchemes();
    loadCategories();
  }, []);

  const loadSchemes = async () => {
    const res = await getAllSchemes();
    const schemeList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.content)
        ? res.data.content
        : [];

    setSchemes(schemeList);
  };

  const loadCategories = async () => {
    const res = await getCategories();
    setCategories(res.data || []);
  };

  // 🔍 Filter logic
const filteredSchemes = schemes.filter((scheme) => {
  const matchSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase());

  const matchCategory = filterCategory
    ? scheme.category?.id?.toString() === filterCategory
    : true;

  const matchState = filterState
    ? scheme.state === filterState
    : true;

  return matchSearch && matchCategory && matchState;
});

// 📄 Pagination logic
const indexOfLast = currentPage * ITEMS_PER_PAGE;
const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;

const currentSchemes = filteredSchemes.slice(indexOfFirst, indexOfLast);
const totalPages = Math.max(1, Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE));

useEffect(() => {
  setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
}, [totalPages]);

  const toggleTitle = (id) => {
    setExpandedTitles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "schemeType" && value === "CENTRAL") {
      setFormData((prev) => ({ ...prev, schemeType: value, state: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
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

  const closeSchemeModal = () => {
    setShowSchemeModal(false);
    setEditingScheme(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;

    if (formData.schemeType === "STATE" && !formData.state) {
      alert("Please select a state");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => value && data.append(key, value));

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

    closeSchemeModal();
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

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setNewCategory(cat.name);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setNewCategory("");
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="scheme-container">
      <div className="scheme-header">
        <h2>Government Schemes</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {canManage && (
            <>
              <button
                onClick={() => setShowCategoryModal(true)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "#1976d2",
                  color: "white",
                  whiteSpace: "nowrap",
                }}
              >
                Create Category
              </button>
              <button
                onClick={() => setShowSchemeModal(true)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "#2e7d32",
                  color: "white",
                  whiteSpace: "nowrap",
                }}
              >
                Create Scheme
              </button>
            </>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "700",
                backgroundColor: "#f0f0f0",
                color: "#df402e",
                lineHeight: 1,
              }}
            >
              X
            </button>
          )}
        </div>
      </div>
<div className="scheme-filter-bar">

  <input
    type="text"
    placeholder="Search schemes..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }}
    className="scheme-filter-input"
  />

  <select
    value={filterCategory}
    onChange={(e) => {
      setFilterCategory(e.target.value);
      setCurrentPage(1);
    }}
    className="scheme-filter-select"
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>

  <select
    value={filterState}
    onChange={(e) => {
      setFilterState(e.target.value);
      setCurrentPage(1);
    }}
    className="scheme-filter-select"
  >
    <option value="">All States</option>
    <option value="BIHAR">Bihar</option>
    <option value="UTTAR_PRADESH">UP</option>
    <option value="GUJARAT">Gujarat</option>
    <option value="MAHARASHTRA">Maharashtra</option>
    <option value="JHARKHAND">Jharkhand</option>
  </select>
<button
  onClick={() => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterState("");
    setCurrentPage(1);
  }}
  className="scheme-clear-btn"
>
  Clear
</button>
</div>
      <div className="scheme-table-wrapper">
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
            {currentSchemes.length > 0 ? (
              currentSchemes.map((scheme) => (
                <tr key={scheme.id}>
                  <td>
                    {expandedTitles[scheme.id]
                      ? scheme.title
                      : scheme.title.split(" ").slice(0, 4).join(" ") +
                        (scheme.title.split(" ").length > 4 ? "..." : "")}

                    {scheme.title.split(" ").length > 4 && (
                      <span
                        onClick={() => toggleTitle(scheme.id)}
                        style={{
                          color: "blue",
                          cursor: "pointer",
                          marginLeft: "6px",
                          fontSize: "13px",
                        }}
                      >
                        {expandedTitles[scheme.id] ? "View Less" : "View More"}
                      </span>
                    )}
                  </td>

                  <td>{scheme.schemeType}</td>
                  <td>{scheme.state || "-"}</td>
                  <td>{scheme.category?.name}</td>

                  {canManage && (
                    <td>
                      <div className="scheme-actions">
                        <button
                          onClick={() => {
                            setSelectedScheme(scheme);
                            setShowDetailModal(true);
                          }}
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            backgroundColor: "#6c757d",
                            color: "#fff",
                            minWidth: "65px",
                          }}
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleEdit(scheme)}
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            backgroundColor: "#2ecc71",
                            color: "#fff",
                            minWidth: "65px",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(scheme.id)}
                          style={{
                            padding: "6px 14px",
                            fontSize: "13px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            backgroundColor: "#e74c3c",
                            color: "#fff",
                            minWidth: "65px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="scheme-empty">
                  No schemes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
</div>

<div className="scheme-pagination">
  <button
    className="scheme-page-btn"
    onClick={() =>
      setCurrentPage((p) => Math.max(p - 1, 1))
    }
    disabled={currentPage === 1}
  >
    ← Prev
  </button>

  <div className="scheme-page-info">
    Page {currentPage} of {totalPages}
  </div>

  <button
    className="scheme-page-btn"
    onClick={() =>
      setCurrentPage((p) =>
        Math.min(p + 1, totalPages)
      )
    }
    disabled={currentPage >= totalPages}
  >
    Next →
  </button>
</div>





      {showDetailModal &&
        selectedScheme &&
        ReactDOM.createPortal(
          <div className="scheme-details-overlay">
            <div className="scheme-details-modal">
              <button className="scheme-modal-close" onClick={() => setShowDetailModal(false)}>
                X
              </button>
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

      {canManage &&
        showSchemeModal &&
        ReactDOM.createPortal(
          <div className="scheme-form-overlay">
            <div className="scheme-form-modal">
              <button className="scheme-modal-close" onClick={closeSchemeModal}>
                X
              </button>
              <h3>{editingScheme ? "Edit Scheme" : "Create Scheme"}</h3>

              <form onSubmit={handleSubmit} className="scheme-form">
                <div className="form-grid">
                  <select name="schemeType" value={formData.schemeType} onChange={handleChange}>
                    <option value="CENTRAL">Central</option>
                    <option value="STATE">State</option>
                  </select>

                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
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

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                  />
                  <textarea
                    name="detail"
                    value={formData.detail}
                    onChange={handleChange}
                    placeholder="Description"
                  />
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="Benefits"
                  />
                  <textarea
                    name="eligibility"
                    value={formData.eligibility}
                    onChange={handleChange}
                    placeholder="Eligibility"
                  />
                  <input
                    name="schemeUrl"
                    value={formData.schemeUrl}
                    onChange={handleChange}
                    placeholder="URL"
                  />
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

      {canManage &&
        showCategoryModal &&
        ReactDOM.createPortal(
          <div className="scheme-modal">
            <div className="scheme-category-modal">
              <button className="scheme-close-btn" onClick={closeCategoryModal}>
                X
              </button>
              <h3>{editingCategory ? "Edit Category" : "Create Category"}</h3>

              <div className="scheme-category-form">
                <input
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />

                <div className="form-footer">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCategory.trim()) return;

                      if (editingCategory) {
                        await updateCategory(editingCategory.id, newCategory);
                        alert("Category updated");
                      } else {
                        await createCategory(newCategory);
                        alert("Category created");
                      }

                      loadCategories();
                      closeCategoryModal();
                    }}
                  >
                    {editingCategory ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </div>

              <div className="scheme-category-list">
                <h4>All Categories</h4>

                {categories.map((cat) => (
                  <div key={cat.id} className="scheme-category-row">
                    <span>{cat.name}</span>

                    <div className="scheme-category-actions">
                      <button onClick={() => handleEditCategory(cat)}>
                        Edit
                      </button>

                      <button onClick={() => handleDeleteCategory(cat.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SchemeAdmin;
