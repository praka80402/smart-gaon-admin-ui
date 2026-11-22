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

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  TRANSLATABLE_FIELDS,
  emptyContentForAllLanguages,
  getCategoryName,
  getLanguage,
  getSchemeContent,
  schemeHasLanguage,
} from "./languages";

import "./SchemeAdmin.css";
import "./SchemeLanguage.css";

const ITEMS_PER_PAGE = 5;

const emptyCategoryNames = () =>
  Object.fromEntries(LANGUAGES.map((l) => [l.code, ""]));

const initialFormData = () => ({
  schemeType: "CENTRAL",
  categoryId: "",
  state: "",
  schemeUrl: "",
  image: null,
  // Text per language: { EN: {title, detail, benefits, eligibility}, HI: {...}, MR: {...} }
  content: emptyContentForAllLanguages(),
});

// Small tab bar used in the form, the detail popup and the category popup.
const LanguageTabs = ({ value, onChange, isFilled }) => (
  <div className="lang-tabs" role="tablist">
    {LANGUAGES.map((lang) => (
      <button
        key={lang.code}
        type="button"
        role="tab"
        aria-selected={value === lang.code}
        className={`lang-tab ${value === lang.code ? "active" : ""}`}
        onClick={() => onChange(lang.code)}
      >
        {lang.nativeLabel}
        {isFilled && (
          <span className={`lang-tab-dot ${isFilled(lang.code) ? "filled" : ""}`} />
        )}
      </button>
    ))}
  </div>
);

  const SchemeAdmin = ({ onClose }) => {
  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";


  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterMissingLang, setFilterMissingLang] = useState("");
  const [displayLang, setDisplayLang] = useState(DEFAULT_LANGUAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [editingScheme, setEditingScheme] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [detailLang, setDetailLang] = useState(DEFAULT_LANGUAGE);
  const [newCategory, setNewCategory] = useState(emptyCategoryNames());
  const [categoryLang, setCategoryLang] = useState(DEFAULT_LANGUAGE);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLang, setFormLang] = useState(DEFAULT_LANGUAGE);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormData());

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
  // Search matches the title in ANY language
  const term = searchTerm.toLowerCase();
  const matchSearch =
    !term ||
    LANGUAGES.some((l) =>
      getSchemeContent(scheme, l.code).title.toLowerCase().includes(term)
    );

  const matchCategory = filterCategory
    ? scheme.category?.id?.toString() === filterCategory
    : true;

  const matchState = filterState
    ? scheme.state === filterState
    : true;

  // "Missing Hindi" etc. — helps admins find schemes still to translate
  const matchMissing = filterMissingLang
    ? !schemeHasLanguage(scheme, filterMissingLang)
    : true;

  return matchSearch && matchCategory && matchState && matchMissing;
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

  // Shared (non-language) fields: type, category, state, URL, image
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "schemeType" && value === "CENTRAL") {
      setFormData((prev) => ({ ...prev, schemeType: value, state: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  // Language-specific fields: title, detail, benefits, eligibility (for the active tab)
  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [formLang]: { ...prev.content[formLang], [name]: value },
      },
    }));
  };

  const isLangFilled = (code) =>
    Boolean(formData.content[code]?.title?.trim());

  const resetForm = () => {
    setFormData(initialFormData());
    setFormLang(DEFAULT_LANGUAGE);
  };

  const closeSchemeModal = () => {
    setShowSchemeModal(false);
    setEditingScheme(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage || saving) return;

    if (formData.schemeType === "STATE" && !formData.state) {
      alert("Please select a state");
      return;
    }

    const { content, ...shared } = formData;
    const en = content[DEFAULT_LANGUAGE];

    // English is the base language — needed as the fallback on the website
    if (!en.title.trim()) {
      setFormLang(DEFAULT_LANGUAGE);
      alert("Please enter the English title (it is shown when a translation is missing)");
      return;
    }

    // Collect other languages that have anything filled in
    const translations = {};
    for (const lang of LANGUAGES) {
      if (lang.code === DEFAULT_LANGUAGE) continue;
      const c = content[lang.code];
      const hasAny = TRANSLATABLE_FIELDS.some((f) => c[f]?.trim());
      if (!hasAny) continue;

      if (!c.title.trim()) {
        setFormLang(lang.code);
        alert(`Please enter the ${lang.label} title, or clear the other ${lang.label} fields`);
        return;
      }
      translations[lang.code] = Object.fromEntries(
        TRANSLATABLE_FIELDS.map((f) => [f, c[f]?.trim() || ""])
      );
    }

    const data = new FormData();
    Object.entries(shared).forEach(([key, value]) => value && data.append(key, value));
    TRANSLATABLE_FIELDS.forEach((f) => data.append(f, en[f]?.trim() || ""));
    data.append("translations", JSON.stringify(translations));

    setSaving(true);
    try {
      if (editingScheme) {
        await updateScheme(editingScheme.id, data);
        alert("Scheme Updated");
      } else {
        await createScheme(data);
        alert("Scheme Created");

        await addDoc(collection(db, "notifications"), {
          title: "New Government Scheme",
          message: en.title.trim(),
          // Title per language so the website can show the notification in the user's language
          messageTranslations: Object.fromEntries(
            Object.entries(translations).map(([code, c]) => [code, c.title])
          ),
          type: "scheme",
          createdAt: serverTimestamp(),
        });
      }

      closeSchemeModal();
      loadSchemes();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Could not save the scheme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (scheme) => {
    if (!canManage) return;

    const content = emptyContentForAllLanguages();
    content[DEFAULT_LANGUAGE] = {
      title: scheme.title || "",
      detail: scheme.detail || "",
      benefits: scheme.benefits || "",
      eligibility: scheme.eligibility || "",
    };
    Object.entries(scheme.translations || {}).forEach(([code, c]) => {
      if (content[code]) {
        content[code] = {
          title: c?.title || "",
          detail: c?.detail || "",
          benefits: c?.benefits || "",
          eligibility: c?.eligibility || "",
        };
      }
    });

    setEditingScheme(scheme);
    setFormData({
      schemeType: scheme.schemeType,
      categoryId: scheme.category?.id || "",
      state: scheme.state || "",
      schemeUrl: scheme.schemeUrl || "",
      image: null,
      content,
    });
    setFormLang(DEFAULT_LANGUAGE);
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
    const names = emptyCategoryNames();
    names[DEFAULT_LANGUAGE] = cat.name || "";
    Object.entries(cat.nameTranslations || {}).forEach(([code, value]) => {
      if (code in names) names[code] = value || "";
    });
    setNewCategory(names);
    setCategoryLang(DEFAULT_LANGUAGE);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setNewCategory(emptyCategoryNames());
    setCategoryLang(DEFAULT_LANGUAGE);
  };

  const handleSaveCategory = async () => {
    const englishName = newCategory[DEFAULT_LANGUAGE]?.trim();
    if (!englishName) {
      setCategoryLang(DEFAULT_LANGUAGE);
      alert("Please enter the English category name");
      return;
    }

    const translations = {};
    LANGUAGES.forEach((l) => {
      const v = newCategory[l.code]?.trim();
      if (l.code !== DEFAULT_LANGUAGE && v) translations[l.code] = v;
    });

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, englishName, translations);
        alert("Category updated");
      } else {
        await createCategory(englishName, translations);
        alert("Category created");
      }

      loadCategories();
      loadSchemes(); // category names inside schemes may have changed
      closeCategoryModal();
    } catch (err) {
      console.error(err);
      alert("Could not save the category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const activeContent = formData.content[formLang];
  const activeLang = getLanguage(formLang);
  const detailContent = selectedScheme ? getSchemeContent(selectedScheme, detailLang) : null;

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
        {getCategoryName(cat, displayLang)}
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
    <option value="MADHYA_PRADESH">Madhya Pradesh</option>
    <option value="JHARKHAND">Jharkhand</option>
  </select>

  <select
    value={filterMissingLang}
    onChange={(e) => {
      setFilterMissingLang(e.target.value);
      setCurrentPage(1);
    }}
    className="scheme-filter-select"
    title="Show schemes that still need a translation"
  >
    <option value="">All Translations</option>
    {LANGUAGES.filter((l) => l.code !== DEFAULT_LANGUAGE).map((l) => (
      <option key={l.code} value={l.code}>
        Missing {l.label}
      </option>
    ))}
  </select>

  <select
    value={displayLang}
    onChange={(e) => setDisplayLang(e.target.value)}
    className="scheme-filter-select"
    title="Language used to show titles in this table"
  >
    {LANGUAGES.map((l) => (
      <option key={l.code} value={l.code}>
        View in: {l.nativeLabel}
      </option>
    ))}
  </select>

<button
  onClick={() => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterState("");
    setFilterMissingLang("");
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
              currentSchemes.map((scheme) => {
                const title = getSchemeContent(scheme, displayLang).title;
                const words = title.split(" ");
                const showingFallback =
                  displayLang !== DEFAULT_LANGUAGE && !schemeHasLanguage(scheme, displayLang);

                return (
                <tr key={scheme.id}>
                  <td>
                    {expandedTitles[scheme.id]
                      ? title
                      : words.slice(0, 4).join(" ") +
                        (words.length > 4 ? "..." : "")}

                    {words.length > 4 && (
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

                    {showingFallback && (
                      <span className="lang-fallback-note" title="Not translated yet — showing English">
                        (EN)
                      </span>
                    )}

                    {/* Only the languages this scheme actually has */}
                    <div className="lang-badges">
                      {LANGUAGES.filter((l) => schemeHasLanguage(scheme, l.code)).map((l) => (
                        <span key={l.code} className="lang-badge" title={l.label}>
                          {l.code}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>{scheme.schemeType}</td>
                  <td>{scheme.state || "-"}</td>
                  <td>{getCategoryName(scheme.category, displayLang)}</td>

                  {canManage && (
                    <td>
                      <div className="scheme-actions">
                        <button
                          onClick={() => {
                            setSelectedScheme(scheme);
                            setDetailLang(displayLang);
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
                );
              })
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

              <LanguageTabs
                value={detailLang}
                onChange={setDetailLang}
                isFilled={(code) => schemeHasLanguage(selectedScheme, code)}
              />

              {!schemeHasLanguage(selectedScheme, detailLang) && (
                <p className="lang-missing-banner">
                  Not translated to {getLanguage(detailLang).label} yet — the website will show English.
                </p>
              )}

              <h3 lang={detailLang.toLowerCase()}>{detailContent.title}</h3>
              <div className="details-content" lang={detailLang.toLowerCase()}>
                <p><strong>Type:</strong> {selectedScheme.schemeType}</p>
                <p><strong>State:</strong> {selectedScheme.state || "N/A"}</p>
                <p><strong>Category:</strong> {getCategoryName(selectedScheme.category, detailLang)}</p>
                <p><strong>Description:</strong> {detailContent.detail}</p>
                <p><strong>Benefits:</strong> {detailContent.benefits}</p>
                <p><strong>Eligibility:</strong> {detailContent.eligibility}</p>
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
                {/* -------- Shared details (same for every language) -------- */}
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
                        {getCategoryName(category, formLang)}
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
                      <option value="MADHYA_PRADESH">Madhya Pradesh</option>
                      <option value="JHARKHAND">Jharkhand</option>
                    </select>

                  )}

                  <input
                    name="schemeUrl"
                    value={formData.schemeUrl}
                    onChange={handleChange}
                    placeholder="URL"
                  />
                  <input type="file" name="image" onChange={handleChange} />
                </div>

                {/* -------- Text per language -------- */}
                <div className="lang-section">
                  <div className="lang-section-head">
                    <span className="lang-section-label">Scheme content language</span>
                    <LanguageTabs value={formLang} onChange={setFormLang} isFilled={isLangFilled} />
                  </div>

                  <p className="lang-hint">
                    {formLang === DEFAULT_LANGUAGE
                      ? "English is required. It is shown on the website whenever a translation is missing."
                      : `Optional. Fill in ${activeLang.label} so visitors using ${activeLang.nativeLabel} see this scheme in their language. Empty fields fall back to English.`}
                  </p>

                  <div className="form-grid" key={formLang} lang={formLang.toLowerCase()}>
                    <input
                      name="title"
                      value={activeContent.title}
                      onChange={handleContentChange}
                      placeholder={`Title (${activeLang.nativeLabel})${formLang === DEFAULT_LANGUAGE ? " *" : ""}`}
                    />
                    <textarea
                      name="detail"
                      value={activeContent.detail}
                      onChange={handleContentChange}
                      placeholder={`Description (${activeLang.nativeLabel})`}
                    />
                    <textarea
                      name="benefits"
                      value={activeContent.benefits}
                      onChange={handleContentChange}
                      placeholder={`Benefits (${activeLang.nativeLabel})`}
                    />
                    <textarea
                      name="eligibility"
                      value={activeContent.eligibility}
                      onChange={handleContentChange}
                      placeholder={`Eligibility (${activeLang.nativeLabel})`}
                    />
                  </div>
                </div>

                <div className="form-footer">
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingScheme ? "Update Scheme" : "Save Scheme"}
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
                <LanguageTabs
                  value={categoryLang}
                  onChange={setCategoryLang}
                  isFilled={(code) => Boolean(newCategory[code]?.trim())}
                />
                <input
                  key={categoryLang}
                  lang={categoryLang.toLowerCase()}
                  placeholder={`Category name (${getLanguage(categoryLang).nativeLabel})${
                    categoryLang === DEFAULT_LANGUAGE ? " *" : ""
                  }`}
                  value={newCategory[categoryLang] || ""}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, [categoryLang]: e.target.value }))
                  }
                />

                <div className="form-footer">
                  <button type="button" onClick={handleSaveCategory}>
                    {editingCategory ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </div>

              <div className="scheme-category-list">
                <h4>All Categories</h4>

                {categories.map((cat) => (
                  <div key={cat.id} className="scheme-category-row">
                    <span>
                      {cat.name}
                      {LANGUAGES.filter((l) => l.code !== DEFAULT_LANGUAGE).map((l) =>
                        cat.nameTranslations?.[l.code] ? (
                          <span key={l.code} className="lang-category-alt">
                            {" "}· {cat.nameTranslations[l.code]}
                          </span>
                        ) : null
                      )}
                    </span>

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