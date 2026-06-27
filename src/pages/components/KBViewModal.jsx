import React, { useState, useEffect } from 'react';
import { kbGetActivity } from '../../utils/kbApi';
import { formatBytes, formatDate, getExtMeta, ACCESS_META } from '../../utils/kbHelpers';
import './KBViewModal.css';

const FILE_EMOJI = {
  pdf: '📄', doc: '📝', docx: '📝',
  xls: '📊', xlsx: '📊', txt: '📃',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
};

const actColor = (action) => ({
  upload:   { background: '#EAF3DE', color: '#3B6D11' },
  view:     { background: '#E6F1FB', color: '#185FA5' },
  download: { background: '#EEEDFE', color: '#3C3489' },
  delete:   { background: '#fee2e2', color: '#dc2626' },
  restore:  { background: '#FAEEDA', color: '#633806' },
}[action] || { background: '#f1f5f9', color: '#374151' });

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

  const tabs = ['details', ...(userRole === 'admin' ? ['activity'] : [])];

  const detailRows = [
    ['Category',     doc.category],
    ['File type',    ext.label],
    ['File size',    formatBytes(doc.file_size_bytes)],
    ['Version',      doc.version_tag],
    ['Uploaded by',  doc.uploaded_by_name],
    ['Uploaded on',  formatDate(doc.created_at)],
    ['Last updated', formatDate(doc.updated_at)],
  ];

  return (
    <div className="kb-view-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="kb-view-modal">

        {/* Header */}
        <div className="kb-view-header">
          <div className="kb-view-header-left">
            <div className="kb-view-icon-box" style={{ background: ext.bg }}>
              <span style={{ color: ext.color }}>
                {FILE_EMOJI[doc.extension] || '📁'}
              </span>
            </div>
            <div>
              <h2 className="kb-view-title">{doc.name}</h2>
              <p className="kb-view-sub">{doc.original_name}</p>
            </div>
          </div>
          <button className="kb-view-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="kb-view-tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`kb-view-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {tab === 'details' && (
          <div className="kb-view-body">
            {detailRows.map(([k, v]) => (
              <div key={k} className="kb-view-row">
                <span className="kb-view-row-key">{k}</span>
                <span className="kb-view-row-val">{v || '—'}</span>
              </div>
            ))}

            <div className="kb-view-row">
              <span className="kb-view-row-key">Access level</span>
              <span
                className="kb-view-access-badge"
                style={{ background: access.bg, color: access.color }}
              >
                {access.label}
              </span>
            </div>

            {doc.description && (
              <div className="kb-view-row col">
                <span className="kb-view-row-key">Description</span>
                <p className="kb-view-desc">{doc.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Activity tab */}
        {tab === 'activity' && (
          <div className="kb-view-body">
            {loadingAct ? (
              <p className="kb-view-empty">Loading…</p>
            ) : activity.length === 0 ? (
              <p className="kb-view-empty">No activity recorded yet.</p>
            ) : activity.map((a, i) => (
              <div key={i} className="kb-view-act-row">
                <span
                  className="kb-view-act-badge"
                  style={actColor(a.action)}
                >
                  {a.action}
                </span>
                <div>
                  <p className="kb-view-act-name">
                    {a.user_name || 'Unknown'}{' '}
                    <span className="kb-view-act-role">({a.user_role})</span>
                  </p>
                  <p className="kb-view-act-meta">
                    {formatDate(a.created_at)} · {a.ip_address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Download button */}
        <button
          className="kb-view-dl-btn"
          onClick={() => { onDownload(doc); onClose(); }}
        >
          ↓ &nbsp;Download file
        </button>

      </div>
    </div>
  );
}
