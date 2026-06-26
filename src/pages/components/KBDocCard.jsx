import React from 'react';
import { getExtMeta, formatBytes, formatDate, ACCESS_META } from '../../utils/kbHelpers';


export default function KBDocCard({ doc, userRole, onView, onDownload, onDelete }) {
  const ext    = getExtMeta(doc.extension);
  const access = ACCESS_META[doc.access_level] || ACCESS_META.developer;

  const emoji = { pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', txt:'📃', jpg:'🖼️', jpeg:'🖼️', png:'🖼️' };

  return (
    <div
      style={S.card}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#ccc'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
    >
      {/* Top row: icon + ext badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...S.iconBox, background: ext.bg }}>
          <span style={{ fontSize: 18, color: ext.color }}>
            {emoji[doc.extension] || '📁'}
          </span>
        </div>
        <span style={{ ...S.extBadge, background: ext.bg, color: ext.color }}>{ext.label}</span>
      </div>

      {/* Name */}
      <p style={S.name} title={doc.name}>{doc.name}</p>

      {/* Version */}
      {doc.version_tag && (
        <span style={S.version}>{doc.version_tag}</span>
      )}

      {/* Category */}
      <span style={{ ...S.catBadge, background: doc.color_hex || '#F1EFE8' }}>
        {doc.category}
      </span>

      {/* Meta */}
      <div style={S.meta}>
        <span>{formatBytes(doc.file_size_bytes)}</span>
        <span style={{ color: '#ddd' }}>·</span>
        <span>{formatDate(doc.created_at)}</span>
      </div>

      {/* Access level */}
      <span style={{ ...S.accessBadge, background: access.bg, color: access.color }}>
        🔒 {access.label}
      </span>

      {/* Uploader */}
      <p style={S.uploader}>by {doc.uploaded_by_name}</p>

      {/* Actions */}
      <div style={S.actions}>
        <button style={S.actBtn} onClick={() => onView(doc)} title="View details">
          👁 View
        </button>
        <button style={S.actBtn} onClick={() => onDownload(doc)} title="Download">
          ↓ Download
        </button>
         
         <button style={{ ...S.actBtn, ...S.delBtn }} onClick={() => onDelete(doc)} title="Delete">
    🗑
  </button>
 
      </div>
    </div>
  );
}

const S = {
  card:       { background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, transition: 'border-color .15s', fontFamily: 'inherit' },
  iconBox:    { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  extBadge:   { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: .4 },
  name:       { margin: 0, fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  version:    { fontSize: 10, color: '#999', background: '#f5f5f5', borderRadius: 6, padding: '2px 7px', width: 'fit-content' },
  catBadge:   { fontSize: 11, padding: '3px 9px', borderRadius: 20, color: '#444', width: 'fit-content' },
  meta:       { display: 'flex', gap: 6, fontSize: 11, color: '#aaa', alignItems: 'center' },
  accessBadge:{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, width: 'fit-content' },
  uploader:   { margin: 0, fontSize: 11, color: '#bbb' },
  actions:    { display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid #f5f5f5', marginTop: 2 },
  actBtn:     { flex: 1, padding: '6px 4px', border: '1px solid #eee', borderRadius: 8, background: '#fafafa', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#444', transition: 'all .12s' },
  delBtn:     { flex: '0 0 36px', color: '#A32D2D', background: '#FCEBEB', borderColor: '#F09595' },
};
