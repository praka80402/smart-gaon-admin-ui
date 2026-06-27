import React, { useState, useRef } from 'react';
import { kbUploadDocument } from '../../utils/kbApi';
import './KBUploadModal.css';

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png';
const ALLOWED_EXTS = ['pdf','doc','docx','xls','xlsx','txt','jpg','jpeg','png'];

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
    if (!ALLOWED_EXTS.includes(ext)) {
      return setError('File type not allowed. Accepted: PDF, Word, Excel, TXT, JPEG, PNG');
    }
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

  const dropzoneClass = [
    'kb-upload-dropzone',
    drag     ? 'drag-active' : '',
    file     ? 'file-done'   : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="kb-upload-overlay"
      onClick={e => e.target === e.currentTarget && !uploading && onClose()}
    >
      <div className="kb-upload-modal">

        {/* Header */}
        <div className="kb-upload-header">
          <div>
            <h2 className="kb-upload-title">Upload to knowledge bank</h2>
            <p className="kb-upload-sub">PDF · Word · Excel · TXT · JPEG · PNG &nbsp;·&nbsp; Max 50 MB</p>
          </div>
          {!uploading && (
            <button className="kb-upload-close" onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>

        {/* Drop zone */}
        <div
          className={dropzoneClass}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={ACCEPTED}
            onChange={e => pickFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <div className="kb-upload-dropzone-icon">📄</div>
              <p className="kb-upload-file-name">{file.name}</p>
              <p className="kb-upload-file-size">{(file.size / 1024).toFixed(1)} KB</p>
              {!uploading && (
                <p className="kb-upload-file-change">Click to change file</p>
              )}
            </div>
          ) : (
            <div>
              <div className="kb-upload-dropzone-icon">☁️</div>
              <p className="kb-upload-dropzone-text">
                Drop file here or <span className="kb-upload-dropzone-link">browse</span>
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="kb-upload-progress-wrap">
            <div className="kb-upload-progress-top">
              <span className="kb-upload-progress-label">Uploading to S3…</span>
              <span className="kb-upload-progress-pct">{progress}%</span>
            </div>
            <div className="kb-upload-progress-bar">
              <div className="kb-upload-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Name + Version */}
        <div className="kb-upload-row2">
          <Field label="Document name *">
            <input
              className="kb-upload-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Stripe API Keys"
              disabled={uploading}
            />
          </Field>
          <Field label="Version">
            <input
              className="kb-upload-input"
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="v1"
              disabled={uploading}
            />
          </Field>
        </div>

        {/* Category + Access */}
        <div className="kb-upload-row2">
          <Field label="Category *">
            <select
              className="kb-upload-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              disabled={uploading}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Access level">
            <select
              className="kb-upload-select"
              value={access}
              onChange={e => setAccess(e.target.value)}
              disabled={uploading}
            >
              <option value="developer">All developers</option>
              <option value="senior">Senior only</option>
              <option value="admin">Admin only</option>
            </select>
          </Field>
        </div>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            className="kb-upload-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description…"
            disabled={uploading}
          />
        </Field>

        {/* Error */}
        {error && <p className="kb-upload-error">⚠ {error}</p>}

        {/* Submit */}
        <button
          className="kb-upload-submit"
          onClick={submit}
          disabled={uploading}
        >
          {uploading ? `Uploading… ${progress}%` : '↑  Upload document'}
        </button>

      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="kb-upload-field">
      <label className="kb-upload-label">{label}</label>
      {children}
    </div>
  );
}
