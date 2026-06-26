import React, { useState, useRef } from 'react';
import { kbUploadDocument } from '../../utils/kbApi';


const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png';

export default function KBUploadModal({ categories, onClose, onUploaded }) {
  const [file,        setFile]        = useState(null);
  const [drag,        setDrag]        = useState(false);
  const [name,        setName]        = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [access,      setAccess]      = useState('developer');
  const [description, setDescription] = useState('');
  const [version,     setVersion]     = useState('v1');
  const [progress,    setProgress]    = useState(0);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState('');
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    const ok  = ['pdf','doc','docx','xls','xlsx','txt','jpg','jpeg','png'].includes(ext);
    if (!ok) return setError('File type not allowed. Accepted: PDF, Word, Excel, TXT, JPEG, PNG');
    setFile(f);
    setName(f.name.replace(/\.[^.]+$/, ''));
    setError('');
  };

  const submit = async () => {
    if (!file)        return setError('Please select a file.');
    if (!categoryId)  return setError('Please choose a category.');
    if (!name.trim()) return setError('Please enter a document name.');

    const fd = new FormData();
    fd.append('file',         file);
    fd.append('name',         name.trim());
    fd.append('category_id',  categoryId);
    fd.append('access_level', access);
    fd.append('description',  description);
    fd.append('version_tag',  version);

    setUploading(true); setError(''); setProgress(0);
    try {
      await kbUploadDocument(fd, setProgress);
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && !uploading && onClose()}>
      <div style={S.modal}>

        <div style={S.mHeader}>
          <div>
            <h2 style={S.mTitle}>Upload to knowledge bank</h2>
            <p style={S.mSub}>PDF · Word · Excel · TXT · JPEG · PNG &nbsp;·&nbsp; Max 50 MB</p>
          </div>
          {!uploading && <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>}
        </div>

        <div
          style={{ ...S.dropZone, ...(drag ? S.dropActive : {}), ...(file ? S.dropDone : {}) }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && inputRef.current.click()}
        >
          <input ref={inputRef} type="file" hidden accept={ACCEPTED} onChange={e => pickFile(e.target.files[0])} />
          {file ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111' }}>{file.name}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#888' }}>{(file.size / 1024).toFixed(1)} KB</p>
              {!uploading && <p style={{ margin: '6px 0 0', fontSize: 11, color: '#185FA5', cursor: 'pointer' }}>Click to change file</p>}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>☁️</div>
              <p style={{ margin: 0, fontSize: 13 }}>Drop file here or <span style={{ color: '#185FA5' }}>browse</span></p>
            </div>
          )}
        </div>

        {uploading && (
          <div style={S.progressWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: '#555' }}>Uploading to S3…</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{progress}%</span>
            </div>
            <div style={S.progressBar}>
              <div style={{ ...S.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div style={S.row2}>
          <Field label="Document name *">
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Stripe API Keys" disabled={uploading} />
          </Field>
          <Field label="Version">
            <input style={S.input} value={version} onChange={e => setVersion(e.target.value)} placeholder="v1" disabled={uploading} />
          </Field>
        </div>

        <div style={S.row2}>
          <Field label="Category *">
            <select style={S.select} value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={uploading}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Access level">
            <select style={S.select} value={access} onChange={e => setAccess(e.target.value)} disabled={uploading}>
              <option value="developer">All developers</option>
              <option value="senior">Senior only</option>
              <option value="admin">Admin only</option>
            </select>
          </Field>
        </div>

        <Field label="Description (optional)">
          <textarea style={{ ...S.input, minHeight: 64, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…" disabled={uploading} />
        </Field>

        {error && <p style={S.errMsg}>⚠ {error}</p>}

        <button style={{ ...S.submitBtn, opacity: uploading ? 0.65 : 1 }} onClick={submit} disabled={uploading}>
          {uploading ? `Uploading… ${progress}%` : '↑  Upload document'}
        </button>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: .4 }}>{label}</label>
    {children}
  </div>
);

const S = {
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:        { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 },
  mHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  mTitle:       { fontSize: 16, fontWeight: 700, margin: 0, color: '#111' },
  mSub:         { fontSize: 11, color: '#999', marginTop: 3 },
  closeBtn:     { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa', padding: 2 },
  dropZone:     { border: '2px dashed #ddd', borderRadius: 12, padding: '26px 16px', cursor: 'pointer', transition: 'all .15s', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropActive:   { borderColor: '#378ADD', background: '#f0f7ff' },
  dropDone:     { borderColor: '#97C459', background: '#f5fbee' },
  progressWrap: { background: '#f8f8f8', borderRadius: 8, padding: '10px 12px' },
  progressBar:  { height: 6, background: '#eee', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#378ADD', borderRadius: 6, transition: 'width .2s' },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input:        { padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#111', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', outline: 'none' },
  select:       { padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#111', fontFamily: 'inherit', background: '#fff', width: '100%' },
  errMsg:       { background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '8px 12px', fontSize: 13, margin: 0 },
  submitBtn:    { padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: .2 },
};
