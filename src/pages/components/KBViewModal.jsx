import React, { useState, useEffect } from 'react';
import { kbGetActivity } from '../../utils/kbApi';
import { formatBytes, formatDate, getExtMeta, ACCESS_META } from '../../utils/kbHelpers';

export default function KBViewModal({ doc, userRole, onClose, onDownload }) {
  const [tab,        setTab]        = useState('details');
  const [activity,   setActivity]   = useState([]);
  const [loadingAct, setLoadingAct] = useState(false);

  const ext    = getExtMeta(doc.extension);
  const access = ACCESS_META[doc.access_level] || ACCESS_META.developer;

  useEffect(() => {
    if (tab === 'activity' && userRole === 'admin') {
      setLoadingAct(true);
      kbGetActivity(doc.id)
        .then(r => setActivity(r.data.data))
        .catch(() => {})
        .finally(() => setLoadingAct(false));
    }
  }, [tab, doc.id, userRole]);

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ ...S.iconBox, background: ext.bg }}>
              <span style={{ fontSize: 22, color: ext.color }}>
                {({ pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', txt:'📃', jpg:'🖼️', jpeg:'🖼️', png:'🖼️' })[doc.extension] || '📁'}
              </span>
            </div>
            <div>
              <h2 style={S.title}>{doc.name}</h2>
              <p style={S.sub}>{doc.original_name}</p>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {['details', ...(userRole === 'admin' ? ['activity'] : [])].map(t => (
            <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {tab === 'details' && (
          <div style={S.body}>
            {[
              ['Category',     doc.category],
              ['File type',    ext.label],
              ['File size',    formatBytes(doc.file_size_bytes)],
              ['Version',      doc.version_tag],
              ['Uploaded by',  doc.uploaded_by_name],
              ['Uploaded on',  formatDate(doc.created_at)],
              ['Last updated', formatDate(doc.updated_at)],
            ].map(([k, v]) => (
              <div key={k} style={S.row}>
                <span style={S.rowKey}>{k}</span>
                <span style={S.rowVal}>{v || '—'}</span>
              </div>
            ))}

            <div style={S.row}>
              <span style={S.rowKey}>Access level</span>
              <span style={{ ...S.accessBadge, background: access.bg, color: access.color }}>
                {access.label}
              </span>
            </div>

            {doc.description && (
              <div style={{ ...S.row, flexDirection: 'column', gap: 4 }}>
                <span style={S.rowKey}>Description</span>
                <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.5 }}>{doc.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Activity tab */}
        {tab === 'activity' && (
          <div style={S.body}>
            {loadingAct ? (
              <p style={{ color: '#aaa', fontSize: 13 }}>Loading…</p>
            ) : activity.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: 13 }}>No activity recorded yet.</p>
            ) : activity.map((a, i) => (
              <div key={i} style={S.actRow}>
                <span style={{ ...S.actBadge, ...actColor(a.action) }}>{a.action}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: '#111' }}>
                    {a.user_name || 'Unknown'}{' '}
                    <span style={{ color: '#aaa', fontSize: 11 }}>({a.user_role})</span>
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>
                    {formatDate(a.created_at)} · {a.ip_address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download button */}
        <button style={S.dlBtn} onClick={() => { onDownload(doc); onClose(); }}>
          ↓ &nbsp;Download file
        </button>
      </div>
    </div>
  );
}

const actColor = (action) => ({
  upload:   { background: '#EAF3DE', color: '#3B6D11' },
  view:     { background: '#E6F1FB', color: '#185FA5' },
  download: { background: '#EEEDFE', color: '#3C3489' },
  delete:   { background: '#FCEBEB', color: '#A32D2D' },
  restore:  { background: '#FAEEDA', color: '#633806' },
}[action] || { background: '#f5f5f5', color: '#555' });

const S = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:      { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '22px 24px 16px', borderBottom: '1px solid #f0f0f0' },
  iconBox:    { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:      { margin: 0, fontSize: 15, fontWeight: 700, color: '#111' },
  sub:        { margin: '2px 0 0', fontSize: 11, color: '#aaa' },
  closeBtn:   { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa', padding: 2, flexShrink: 0 },
  tabs:       { display: 'flex', gap: 4, padding: '12px 24px 0', borderBottom: '1px solid #f0f0f0' },
  tab:        { padding: '7px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#aaa', borderBottom: '2px solid transparent', fontWeight: 500 },
  tabActive:  { color: '#111', borderBottomColor: '#111' },
  body:       { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 },
  row:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8f8f8' },
  rowKey:     { fontSize: 12, color: '#aaa', fontWeight: 500 },
  rowVal:     { fontSize: 13, color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: '60%' },
  accessBadge:{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 },
  actRow:     { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8f8f8' },
  actBadge:   { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: .4, flexShrink: 0 },
  dlBtn:      { margin: '0 24px 24px', padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};
