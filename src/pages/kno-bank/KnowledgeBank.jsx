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
// ── Change 'user' to YOUR localStorage key for the logged-in user object
// The user object must have a 'role' field: 'admin' | 'senior' | 'developer'
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};

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
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.modal}>
        <div style={M.header}>
          <h2 style={M.title}>{editCat ? '✏️ Edit category' : '➕ New category'}</h2>
          <button style={M.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={M.field}>
          <label style={M.label}>Category name *</label>
          <input
            style={M.input}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. DevOps, Security, CI/CD"
            autoFocus
          />
        </div>

        <div style={M.field}>
          <label style={M.label}>Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {COLOR_OPTIONS.map(c => (
              <div
                key={c}
                onClick={() => setColorHex(c)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: c, cursor: 'pointer',
                  border: colorHex === c ? '2.5px solid #111' : '2px solid transparent',
                  outline: colorHex === c ? '2px solid #fff' : 'none',
                  outlineOffset: -3,
                  transition: 'all .12s',
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: colorHex, border: '1px solid #eee' }} />
            <span style={{ fontSize: 12, color: '#888' }}>Preview: </span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: colorHex, color: '#444', fontWeight: 500 }}>
              {name || 'Category name'}
            </span>
          </div>
        </div>

        {error && <p style={M.error}>⚠ {error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...M.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : editCat ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </div>
    </div>
  );
}

const M = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:     { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:     { margin: 0, fontSize: 16, fontWeight: 700, color: '#111' },
  closeBtn:  { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa' },
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: .4 },
  input:     { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, color: '#111', fontFamily: 'inherit', outline: 'none' },
  error:     { background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '8px 12px', fontSize: 13, margin: 0 },
  cancelBtn: { flex: 1, padding: '10px', border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  saveBtn:   { flex: 2, padding: '10px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};

// ── Main Page ─────────────────────────────────────────────
export default function KnowledgeBank() {
  const user = getUser();

  const [docs,         setDocs]         = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [activeCat,    setActiveCat]    = useState('');
  const [search,       setSearch]       = useState('');
  const [accessFilter, setAccessFilter] = useState('');
  const [sort,         setSort]         = useState('created_at');
  const [order,        setOrder]        = useState('desc');
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState({});
  const [showUpload,   setShowUpload]   = useState(false);
  const [viewDoc,      setViewDoc]      = useState(null);
  const [toast,        setToast]        = useState(null);
  const [delConfirm,   setDelConfirm]   = useState(null);
  const [showCatMgr,   setShowCatMgr]  = useState(false);
  const [catModal,     setCatModal]     = useState(null); // null | 'new' | {id,name,colorHex}
  const [delCatConfirm,setDelCatConfirm]= useState(null);
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
  useEffect(() => { fetchCategories(); kbGetStats().then(r => setStats(r.data.data || {})).catch(() => {}); }, []);
  useEffect(() => { kbGetStats().then(r => setStats(r.data.data || {})).catch(() => {}); }, [docs]);

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
    <div style={P.page}>

      {/* Header */}
      <div style={P.header}>
        <div>
          <h1 style={P.pageTitle}>📚 Knowledge bank</h1>
          <p style={P.pageSub}>Central repository for project resources, docs & configs</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={P.outlineBtn} onClick={() => setShowCatMgr(true)}>
            🗂 Manage categories
          </button>
          <button style={P.uploadBtn} onClick={() => setShowUpload(true)}>
            ↑ Upload document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={P.statsRow}>
        {[
          { label: 'Total documents',  value: stats.totalDocs       || 0 },
          { label: 'Categories',       value: stats.categoriesUsed  || 0 },
          { label: 'Admin only',       value: stats.adminOnly       || 0 },
          { label: 'Added this month', value: stats.addedThisMonth  || 0 },
          { label: 'Total size',       value: formatBytes(stats.totalSizeBytes) },
        ].map(st => (
          <div key={st.label} style={P.statCard}>
            <div style={P.statVal}>{st.value}</div>
            <div style={P.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={P.filterRow}>
        <div style={P.searchWrap}>
          <span style={{ color: '#bbb', fontSize: 15 }}>🔍</span>
          <input style={P.searchInput} placeholder="Search by name or description…" value={search} onChange={e => handleSearch(e.target.value)} />
          {search && <button style={P.clearBtn} onClick={() => { setSearch(''); setPage(1); }}>✕</button>}
        </div>
        <select style={P.filterSel} value={accessFilter} onChange={e => { setAccessFilter(e.target.value); setPage(1); }}>
          <option value="">All access levels</option>
          <option value="developer">All developers</option>
          <option value="senior">Senior only</option>
          <option value="admin">Admin only</option>
        </select>
        <select style={P.filterSel} value={`${sort}__${order}`} onChange={e => handleSort(e.target.value)}>
          <option value="created_at__desc">Newest first</option>
          <option value="created_at__asc">Oldest first</option>
          <option value="name__asc">Name A–Z</option>
          <option value="name__desc">Name Z–A</option>
          <option value="file_size_bytes__desc">Largest first</option>
        </select>
      </div>

      {/* Category tabs */}
      <div style={P.catRow}>
        <button style={{ ...P.catBtn, ...(activeCat === '' ? P.catActive : {}) }} onClick={() => { setActiveCat(''); setPage(1); }}>
          All {stats.totalDocs > 0 && <span style={P.catCount}>{stats.totalDocs}</span>}
        </button>
        {categories.map(c => (
          <button key={c.id} style={{ ...P.catBtn, ...(activeCat === c.slug ? P.catActive : {}) }} onClick={() => { setActiveCat(c.slug); setPage(1); }}>
            {c.name}
            {Number(c.docCount) > 0 && <span style={P.catCount}>{c.docCount}</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={P.centered}><div style={P.spinner} /></div>
      ) : docs.length === 0 ? (
        <div style={P.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p style={{ margin: 0, fontSize: 14, color: '#aaa' }}>No documents found</p>
          <button style={{ ...P.uploadBtn, marginTop: 14 }} onClick={() => setShowUpload(true)}>Upload your first document</button>
        </div>
      ) : (
        <div style={P.grid}>
          {docs.map(doc => (
            <KBDocCard key={doc.id} doc={doc} userRole={user.role} onView={setViewDoc} onDownload={handleDownload} onDelete={setDelConfirm} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={P.pagination}>
          <button style={P.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: '#888' }}>Page {page} of {pagination.pages} · {pagination.total} docs</span>
          <button style={P.pageBtn} disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* ── Category Manager Panel ── */}
      {showCatMgr && (
        <div style={P.delOverlay} onClick={e => e.target === e.currentTarget && setShowCatMgr(false)}>
          <div style={{ ...P.delBox, maxWidth: 560, textAlign: 'left', padding: 0, overflow: 'hidden' }}>
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🗂 Manage categories</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#999' }}>{categories.length} categories total</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={P.uploadBtn} onClick={() => setCatModal('new')}>+ New category</button>
                <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }} onClick={() => setShowCatMgr(false)}>✕</button>
              </div>
            </div>

            {/* Category list */}
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 24px' }}>
              {categories.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>No categories yet. Create one!</p>
              ) : categories.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: c.colorHex || '#E6F1FB', border: '1px solid #eee' }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: '#aaa', background: '#f5f5f5', borderRadius: 10, padding: '2px 8px' }}>
                      {c.docCount || 0} docs
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={{ padding: '5px 12px', border: '1px solid #eee', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#555' }}
                      onClick={() => setCatModal({ id: c.id, name: c.name, colorHex: c.colorHex, slug: c.slug })}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{ padding: '5px 12px', border: '1px solid #F09595', borderRadius: 7, background: '#FCEBEB', cursor: 'pointer', fontSize: 12, color: '#A32D2D' }}
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
        <div style={P.delOverlay} onClick={e => e.target === e.currentTarget && setDelCatConfirm(null)}>
          <div style={P.delBox}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗂</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#111' }}>Delete category?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
              "<strong>{delCatConfirm.name}</strong>" will be deleted.<br />
              This will fail if the category has documents.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={P.cancelBtn} onClick={() => setDelCatConfirm(null)}>Cancel</button>
              <button style={P.confirmDelBtn} onClick={handleDeleteCategory}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <KBUploadModal categories={categories} onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); fetchDocs(); showToast('Document uploaded successfully ✓'); }} />
      )}

      {/* View modal */}
      {viewDoc && (
        <KBViewModal doc={viewDoc} userRole={user.role} onClose={() => setViewDoc(null)} onDownload={handleDownload} />
      )}

      {/* Delete doc confirm */}
      {delConfirm && (
        <div style={P.delOverlay} onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div style={P.delBox}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗑</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: '#111' }}>Delete document?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
              "<strong>{delConfirm.name}</strong>" will be soft-deleted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={P.cancelBtn} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button style={P.confirmDelBtn} onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...P.toast, background: toast.type === 'error' ? '#FCEBEB' : '#EAF3DE', color: toast.type === 'error' ? '#A32D2D' : '#27500A', borderColor: toast.type === 'error' ? '#F09595' : '#97C459' }}>
          {toast.type === 'error' ? '⚠' : '✓'}&nbsp;{toast.msg}
        </div>
      )}

      <style>{`@keyframes kb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const P = {
  page:         { padding: '28px', maxWidth: 1280, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle:    { margin: 0, fontSize: 22, fontWeight: 700, color: '#111' },
  pageSub:      { margin: '4px 0 0', fontSize: 13, color: '#999' },
  uploadBtn:    { display: 'inline-flex', alignItems: 'center', padding: '9px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  outlineBtn:   { display: 'inline-flex', alignItems: 'center', padding: '9px 16px', background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
  statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 22 },
  statCard:     { background: '#f8f8f8', borderRadius: 10, padding: '14px 16px', textAlign: 'center' },
  statVal:      { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 3 },
  statLabel:    { fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: .4 },
  filterRow:    { display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220, background: '#f5f5f5', border: '1px solid #eee', borderRadius: 9, padding: '8px 12px' },
  searchInput:  { border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111', flex: 1, fontFamily: 'inherit' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 13, padding: 0 },
  filterSel:    { padding: '8px 12px', border: '1px solid #eee', borderRadius: 9, fontSize: 13, color: '#111', background: '#f5f5f5', fontFamily: 'inherit', cursor: 'pointer' },
  catRow:       { display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 },
  catBtn:       { padding: '5px 13px', border: '1px solid #eee', borderRadius: 20, background: '#fff', fontSize: 12, cursor: 'pointer', color: '#666', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all .15s', fontFamily: 'inherit' },
  catActive:    { background: '#111', color: '#fff', borderColor: '#111' },
  catCount:     { background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 6px', fontSize: 10 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  centered:     { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' },
  spinner:      { width: 32, height: 32, border: '3px solid #eee', borderTopColor: '#111', borderRadius: '50%', animation: 'kb-spin 0.8s linear infinite' },
  emptyState:   { textAlign: 'center', padding: '80px 0', color: '#ccc' },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 32 },
  pageBtn:      { padding: '7px 16px', border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#555', fontFamily: 'inherit' },
  delOverlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  delBox:       { background: '#fff', borderRadius: 14, padding: '32px 28px', width: '100%', maxWidth: 360, textAlign: 'center' },
  cancelBtn:    { flex: 1, padding: '10px', border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  confirmDelBtn:{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#A32D2D', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' },
  toast:        { position: 'fixed', bottom: 24, right: 24, padding: '11px 18px', borderRadius: 9, border: '1px solid', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, zIndex: 99999 },
};
