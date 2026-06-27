import React from 'react';
import { getExtMeta, formatBytes, formatDate, ACCESS_META } from '../../utils/kbHelpers';
import './KBDocCard.css';

const FILE_EMOJI = {
  pdf: '📄', doc: '📝', docx: '📝',
  xls: '📊', xlsx: '📊', txt: '📃',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
};

export default function KBDocCard({ doc, userRole, onView, onDownload, onDelete }) {
  const ext    = getExtMeta(doc.extension);
  const access = ACCESS_META[doc.access_level] || ACCESS_META.developer;

  return (
    <div className="kb-doc-card">

      {/* Top row: icon + ext badge */}
      <div className="kb-doc-card-top">
        <div className="kb-doc-icon-box" style={{ background: ext.bg }}>
          <span style={{ color: ext.color }}>
            {FILE_EMOJI[doc.extension] || '📁'}
          </span>
        </div>
        <span
          className="kb-doc-ext-badge"
          style={{ background: ext.bg, color: ext.color }}
        >
          {ext.label}
        </span>
      </div>

      {/* Name */}
      <p className="kb-doc-name" title={doc.name}>{doc.name}</p>

      {/* Version */}
      {doc.version_tag && (
        <span className="kb-doc-version">{doc.version_tag}</span>
      )}

      {/* Category */}
      <span
        className="kb-doc-cat-badge"
        style={{ background: doc.color_hex || '#F1EFE8' }}
      >
        {doc.category}
      </span>

      {/* Meta */}
      <div className="kb-doc-meta">
        <span>{formatBytes(doc.file_size_bytes)}</span>
        <span className="kb-doc-meta-sep">·</span>
        <span>{formatDate(doc.created_at)}</span>
      </div>

      {/* Access level */}
      <span
        className="kb-doc-access-badge"
        style={{ background: access.bg, color: access.color }}
      >
        🔒 {access.label}
      </span>

      {/* Uploader */}
      <p className="kb-doc-uploader">by {doc.uploaded_by_name}</p>

      {/* Spacer — pushes actions to card bottom */}
      <div className="kb-doc-spacer" />

      {/* Actions */}
      <div className="kb-doc-actions">
        <button className="kb-doc-act-btn" onClick={() => onView(doc)} title="View details">
          👁 View
        </button>
        <button className="kb-doc-act-btn" onClick={() => onDownload(doc)} title="Download">
          ↓ Download
        </button>
        <button className="kb-doc-del-btn" onClick={() => onDelete(doc)} title="Delete">
          🗑
        </button>
      </div>

    </div>
  );
}
