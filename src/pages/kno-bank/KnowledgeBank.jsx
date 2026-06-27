/**
 * KnowledgeBank.jsx
 *
 * DROP THIS FILE into your existing: src/pages/KnowledgeBank.jsx
 *
 * Then add ONE route in your existing router:
 *   <Route path="/knowledge-bank" element={<KnowledgeBank />} />
 *
 * And add ONE link in your existing sidebar:
 *   <NavLink to="/knowledge-bank">Knowledge Bank</NavLink>
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  kbGetCategories,
  kbGetStats,
  kbGetDocuments,
  kbGetDownloadUrl,
  kbDeleteDocument,
  kbCreateCategory, kbUpdateCategory, kbDeleteCategory,
} from "../../utils/kbApi";
import { formatBytes } from "../../utils/kbHelpers";
import KBDocCard from "../components/KBDocCard";
import KBUploadModal from "../components/KBUploadModal";
import KBViewModal from "../components/KBViewModal";
import "./KnowledgeBank.css";

// ── Change 'user' to YOUR localStorage key for the logged-in user object
// The user object must have a 'role' field: 'admin' | 'senior' | 'developer'
const getUser = () => ({
  role:  localStorage.getItem('adminRole')  || 'developer',
  name:  localStorage.getItem('adminName')  || '',
  email: localStorage.getItem('adminEmail') || '',
});

const COLOR_OPTIONS = [
  '#E6F1FB','#EAF3DE','#EEEDFE','#FAEEDA',
  '#E1F5EE','#FAE8F8','#FCEBEB','#F1EFE8',
  '#FFF3CD','#D1ECF1','#F8D7DA','#D4EDDA',
];

// ── Category Modal ────────────────────────────────────────
function KBCategoryModal({ editCat, onClose, onSaved, showToast }) {
  const [name,     setName]     = useState(editCat?.name     || '');
  const [colorHex, setColorHex] = useState(editCat?.colorHex || '#E6F1FB');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const submit = async () => {
    if (!name.trim()) return setError('Category name is required');
    setSaving(true); setError('');
    try {
      if (editCat) {
        await kbUpdateCategory(editCat.id, { name: name.trim(), colorHex });
        showToast(`Category "${name}" updated ✓`);
      } else {
        await kbCreateCategory({ name: name.trim(), colorHex });
        showToast(`Category "${name}" created ✓`);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="kb-cat-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="kb-cat-modal">

        <div className="kb-cat-modal-header">
          <h2 className="kb-cat-modal-title">
            {editCat ? '✏️ Edit category' : '➕ New category'}
          </h2>
          <button className="kb-cat-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="kb-cat-modal-field">
          <label className="kb-cat-modal-label">Category name *</label>
          <input
            className="kb-cat-modal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. DevOps, Security, CI/CD"
            autoFocus
          />
        </div>

        <div className="kb-cat-modal-field">
          <label className="kb-cat-modal-label">Color</label>
          <div className="kb-cat-modal-colors">
            {COLOR_OPTIONS.map(c => (
              <div
                key={c}
                onClick={() => setColorHex(c)}
                className={`kb-color-swatch${colorHex === c ? ' selected' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="kb-cat-modal-preview">
            <div
              className="kb-cat-modal-preview-dot"
              style={{ background: colorHex }}
            />
            <span className="kb-cat-modal-preview-text">Preview: </span>
            <span
              className="kb-cat-modal-preview-pill"
              style={{ background: colorHex }}
            >
              {name || 'Category name'}
            </span>
          </div>
        </div>

        {error && <p className="kb-cat-modal-error">⚠ {error}</p>}

        <div className="kb-cat-modal-actions">
          <button className="kb-cat-modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="kb-cat-modal-save"
            onClick={submit}
            disabled={saving}
          >
            {saving ? 'Saving…' : editCat ? 'Save changes' : 'Create category'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function KnowledgeBank() {
  const user = getUser();

  const [docs,          setDocs]          = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [stats,         setStats]         = useState({});
  const [loading,       setLoading]       = useState(true);
  const [activeCat,     setActiveCat]     = useState('');
  const [search,        setSearch]        = useState('');
  const [accessFilter,  setAccessFilter]  = useState('');
  const [sort,          setSort]          = useState('created_at');
  const [order,         setOrder]         = useState('desc');
  const [page,          setPage]          = useState(1);
  const [pagination,    setPagination]    = useState({});
  const [showUpload,    setShowUpload]    = useState(false);
  const [viewDoc,       setViewDoc]       = useState(null);
  const [toast,         setToast]         = useState(null);
  const [delConfirm,    setDelConfirm]    = useState(null);
  const [showCatMgr,    setShowCatMgr]   = useState(false);
  const [catModal,      setCatModal]      = useState(null); // null | 'new' | {id,name,colorHex}
  const [delCatConfirm, setDelCatConfirm] = useState(null);
  const searchTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchCategories = useCallback(() => {
    kbGetCategories()
      .then(r => setCategories(r.data.data || []))
      .catch(e => console.error('[KB] categories:', e));
  }, []);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 18, sort, order };
      if (activeCat)    params.category = activeCat;
      if (search)       params.search   = search;
      if (accessFilter) params.access   = accessFilter;
      const res = await kbGetDocuments(params);
      setDocs(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error('[KB] fetchDocs error:', err);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, sort, order, activeCat, accessFilter, search]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    fetchCategories();
    kbGetStats().then(r => setStats(r.data.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    kbGetStats().then(r => setStats(r.data.data || {})).catch(() => {});
  }, [docs]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPage(1), 400);
  };

  const handleDownload = async (doc) => {
    try {
      const res = await kbGetDownloadUrl(doc.id);
      const a = document.createElement('a');
      a.href = res.data.url; a.download = doc.original_name; a.target = '_blank'; a.click();
      showToast(`Downloading "${doc.name}"`);
    } catch { showToast('Download failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!delConfirm) return;
    try {
      await kbDeleteDocument(delConfirm.id);
      setDocs(prev => prev.filter(d => d.id !== delConfirm.id));
      showToast(`"${delConfirm.name}" deleted`);
    } catch { showToast('Delete failed', 'error'); }
    finally { setDelConfirm(null); }
  };

  const handleDeleteCategory = async () => {
    if (!delCatConfirm) return;
    try {
      await kbDeleteCategory(delCatConfirm.id);
      showToast(`"${delCatConfirm.name}" deleted`);
      fetchCategories();
      if (activeCat === delCatConfirm.slug) setActiveCat('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete — category has documents', 'error');
    } finally { setDelCatConfirm(null); }
  };

  const handleSort = (val) => {
    const [s, o] = val.split('__');
    setSort(s); setOrder(o); setPage(1);
  };

  return (
    <div className="kb-page">
      <div className="kb-content-card">

      {/* Header */}
      <div className="kb-header">
        <div>
          <h1 className="kb-page-title">📚 Knowledge bank</h1>
          <p className="kb-page-sub">Central repository for project resources, docs & configs</p>
        </div>
        <div className="kb-header-actions">
          <button className="kb-outline-btn" onClick={() => setShowCatMgr(true)}>
            🗂 Manage categories
          </button>
          <button className="kb-upload-btn" onClick={() => setShowUpload(true)}>
            ↑ Upload document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="kb-stats-row">
        {[
          { label: 'Total documents',  value: stats.totalDocs       || 0 },
          { label: 'Categories',       value: stats.categoriesUsed  || 0 },
          { label: 'Admin only',       value: stats.adminOnly       || 0 },
          { label: 'Added this month', value: stats.addedThisMonth  || 0 },
          { label: 'Total size',       value: formatBytes(stats.totalSizeBytes) },
        ].map(st => (
          <div key={st.label} className="kb-stat-card">
            <div className="kb-stat-val">{st.value}</div>
            <div className="kb-stat-label">{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="kb-filter-row">
        <div className="kb-search-wrap">
          <span className="kb-search-icon">🔍</span>
          <input
            className="kb-search-input"
            placeholder="Search by name or description…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button className="kb-clear-btn" onClick={() => { setSearch(''); setPage(1); }}>✕</button>
          )}
        </div>
        <select className="kb-filter-sel" value={accessFilter} onChange={e => { setAccessFilter(e.target.value); setPage(1); }}>
          <option value="">All access levels</option>
          <option value="developer">All developers</option>
          <option value="senior">Senior only</option>
          <option value="admin">Admin only</option>
        </select>
        <select className="kb-filter-sel" value={`${sort}__${order}`} onChange={e => handleSort(e.target.value)}>
          <option value="created_at__desc">Newest first</option>
          <option value="created_at__asc">Oldest first</option>
          <option value="name__asc">Name A–Z</option>
          <option value="name__desc">Name Z–A</option>
          <option value="file_size_bytes__desc">Largest first</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="kb-cat-row">
        <button
          className={`kb-cat-btn${activeCat === '' ? ' active' : ''}`}
          onClick={() => { setActiveCat(''); setPage(1); }}
        >
          All {stats.totalDocs > 0 && <span className="kb-cat-count">{stats.totalDocs}</span>}
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`kb-cat-btn${activeCat === c.slug ? ' active' : ''}`}
            onClick={() => { setActiveCat(c.slug); setPage(1); }}
          >
            {c.name}
            {Number(c.docCount) > 0 && <span className="kb-cat-count">{c.docCount}</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="kb-centered"><div className="kb-spinner" /></div>
      ) : docs.length === 0 ? (
        <div className="kb-empty-state">
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p>No documents found</p>
          <button className="kb-upload-btn" onClick={() => setShowUpload(true)}>
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="kb-grid">
          {docs.map(doc => (
            <KBDocCard
              key={doc.id}
              doc={doc}
              userRole={user.role}
              onView={setViewDoc}
              onDownload={handleDownload}
              onDelete={setDelConfirm}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="kb-pagination">
          <button className="kb-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="kb-pagination-info">Page {page} of {pagination.pages} · {pagination.total} docs</span>
          <button className="kb-page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      </div>{/* /kb-content-card */}

      {/* ── Category Manager Panel ── */}
      {showCatMgr && (
        <div className="kb-overlay" onClick={e => e.target === e.currentTarget && setShowCatMgr(false)}>
          <div className="kb-cat-mgr-box">

            <div className="kb-cat-mgr-header">
              <div>
                <h2>🗂 Manage categories</h2>
                <p>{categories.length} categories total</p>
              </div>
              <div className="kb-cat-mgr-header-actions">
                <button className="kb-upload-btn" onClick={() => setCatModal('new')}>+ New category</button>
                <button className="kb-cat-mgr-close" onClick={() => setShowCatMgr(false)}>✕</button>
              </div>
            </div>

            <div className="kb-cat-mgr-list">
              {categories.length === 0 ? (
                <p className="kb-cat-mgr-empty">No categories yet. Create one!</p>
              ) : categories.map(c => (
                <div key={c.id} className="kb-cat-mgr-row">
                  <div className="kb-cat-mgr-row-left">
                    <div
                      className="kb-cat-color-dot"
                      style={{ background: c.colorHex || '#E6F1FB' }}
                    />
                    <span className="kb-cat-mgr-name">{c.name}</span>
                    <span className="kb-cat-doc-count">{c.docCount || 0} docs</span>
                  </div>
                  <div className="kb-cat-mgr-row-actions">
                    <button
                      className="kb-cat-edit-btn"
                      onClick={() => setCatModal({ id: c.id, name: c.name, colorHex: c.colorHex, slug: c.slug })}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="kb-cat-del-btn"
                      onClick={() => setDelCatConfirm(c)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Category create/edit modal */}
      {catModal && (
        <KBCategoryModal
          editCat={catModal === 'new' ? null : catModal}
          showToast={showToast}
          onClose={() => setCatModal(null)}
          onSaved={() => { setCatModal(null); fetchCategories(); }}
        />
      )}

      {/* Delete category confirm */}
      {delCatConfirm && (
        <div className="kb-overlay" onClick={e => e.target === e.currentTarget && setDelCatConfirm(null)}>
          <div className="kb-del-box">
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗂</div>
            <h3>Delete category?</h3>
            <p>
              "<strong>{delCatConfirm.name}</strong>" will be deleted.<br />
              This will fail if the category has documents.
            </p>
            <div className="kb-del-box-actions">
              <button className="kb-cancel-btn" onClick={() => setDelCatConfirm(null)}>Cancel</button>
              <button className="kb-confirm-del-btn" onClick={handleDeleteCategory}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <KBUploadModal
          categories={categories}
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); fetchDocs(); showToast('Document uploaded successfully ✓'); }}
        />
      )}

      {/* View modal */}
      {viewDoc && (
        <KBViewModal
          doc={viewDoc}
          userRole={user.role}
          onClose={() => setViewDoc(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Delete doc confirm */}
      {delConfirm && (
        <div className="kb-overlay" onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div className="kb-del-box">
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗑</div>
            <h3>Delete document?</h3>
            <p>"<strong>{delConfirm.name}</strong>" will be soft-deleted.</p>
            <div className="kb-del-box-actions">
              <button className="kb-cancel-btn" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="kb-confirm-del-btn" onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`kb-toast ${toast.type}`}>
          {toast.type === 'error' ? '⚠' : '✓'}&nbsp;{toast.msg}
        </div>
      )}

    </div>
  );
}
