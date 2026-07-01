export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824)  return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
};

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const EXT_META = {
  pdf:  { bg: '#FAECE7', color: '#993C1D', label: 'PDF'   },
  doc:  { bg: '#E6F1FB', color: '#185FA5', label: 'Word'  },
  docx: { bg: '#E6F1FB', color: '#185FA5', label: 'Word'  },
  xls:  { bg: '#EAF3DE', color: '#3B6D11', label: 'Excel' },
  xlsx: { bg: '#EAF3DE', color: '#3B6D11', label: 'Excel' },
  txt:  { bg: '#F1EFE8', color: '#5F5E5A', label: 'Text'  },
  jpg:  { bg: '#FBEAF0', color: '#993556', label: 'Image' },
  jpeg: { bg: '#FBEAF0', color: '#993556', label: 'Image' },
  png:  { bg: '#FBEAF0', color: '#993556', label: 'Image' },
};

export const getExtMeta = (ext) =>
  EXT_META[(ext || '').toLowerCase()] || { bg: '#F1EFE8', color: '#5F5E5A', label: 'File' };

export const ACCESS_META = {
  developer: { label: 'All developers', bg: '#EAF3DE', color: '#3B6D11' },
  senior:    { label: 'Senior only',    bg: '#E6F1FB', color: '#185FA5' },
  admin:     { label: 'Admin only',     bg: '#FCEBEB', color: '#A32D2D' },
};
