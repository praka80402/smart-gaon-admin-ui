import { useState, useEffect, useRef } from "react";
import { BASE_URL, authHeader } from "../myvillage/services/config";
import "./AdminQuickServices.css";

const ICON_PRESETS = [
  "🏆", "💼", "📜", "🌾", "🏥", "💛", "🧠", "📡", "🎓",
  "🏛️", "🩺", "🌦️", "❤️", "📍", "🛒", "🚜", "🐄", "💧",
];

const EMPTY_FORM = {
  icon: "🏆",
  label: "",
  sub: "",
  path: "",
  active: true,
  isCustom: true,
};

const TABS = [
  { id: "add", label: "Add Service" },
  { id: "manage", label: "Manage & Reorder" },
];

const isImageIcon = (icon) => typeof icon === "string" && icon.startsWith("data:image");

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

function IconPicker({ value, onChange, onError }) {
  const isImage = isImageIcon(value);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type && item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;
          blobToDataUrl(blob)
            .then(onChange)
            .catch(() => onError?.("Couldn't read that pasted image. Try again."));
          return;
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [onChange, onError]);

  // Pasting directly into the custom field also works, for emoji/text or images.
  const handleFieldPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        e.preventDefault();
        e.stopPropagation(); 
        const blob = item.getAsFile();
        if (!blob) continue;
        blobToDataUrl(blob).then(onChange);
        return;
      }
    }
    
  };

  return (
    <div className="qs-icon-field">
      <label className="qs-field-label">Icon</label>
      <div className="qs-icon-grid">
        {ICON_PRESETS.map((ic) => (
          <button
            type="button"
            key={ic}
            className={`qs-icon-choice ${value === ic ? "is-selected" : ""}`}
            onClick={() => onChange(ic)}
          >
            {ic}
          </button>
        ))}
      </div>

      <div className="qs-icon-custom-row">
        <span className="qs-icon-custom-label">Custom:</span>
        <div className={`qs-icon-swatch ${isImage ? "has-image" : ""}`}>
          {isImage ? (
            <>
              <img src={value} alt="Selected icon" className="qs-icon-swatch-img" />
              <button
                type="button"
                className="qs-icon-swatch-clear"
                onClick={() => onChange("🏆")}
                aria-label="Remove custom icon"
              >
                ×
              </button>
            </>
          ) : (
            <input
              ref={inputRef}
              className="qs-icon-text-input"
              type="text"
              value={value}
              maxLength={4}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handleFieldPaste}
              placeholder="✏️"
              aria-label="Custom icon"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          )}
        </div>
        <span className="qs-icon-hint">
          Type an emoji here, or copy any image and press <strong>Ctrl/Cmd+V</strong> —
          works anywhere on this form.
        </span>
      </div>
    </div>
  );
}

export default function AdminQuickServices({ onClose } = {}) {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("add");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Add-service form (Section 1) ---
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  // --- Edit modal (opened from Section 2) ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const dirtyOrderRef = useRef(false);

  useEffect(() => {
    loadServices();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quick-services`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Couldn't load quick services. Try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  // --- Section 1: Add ---

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.label.trim() || !addForm.path.trim()) {
      setError("Name and page path are required.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quick-services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await loadServices();
      setAddForm(EMPTY_FORM);
    } catch (e) {
      console.error(e);
      setError("Couldn't add this service. Check the fields and try again.");
    } finally {
      setAdding(false);
    }
  };

  // --- Section 2: Manage / reorder / remove ---

  const openEdit = (svc) => {
    setEditingId(svc.id);
    setEditForm({
      icon: svc.icon,
      label: svc.label,
      sub: svc.sub || "",
      path: svc.path,
      active: svc.active,
      isCustom: svc.isCustom,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.label.trim() || !editForm.path.trim()) {
      setError("Name and page path are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quick-services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await loadServices();
      closeEdit();
    } catch (e) {
      console.error(e);
      setError("Couldn't save this service. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (svc) => {
    if (!window.confirm(`Remove "${svc.label}" from Quick Services?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quick-services/${svc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      if (editingId === svc.id) closeEdit();
    } catch (e) {
      console.error(e);
      setError("Couldn't remove this service.");
    }
  };

  const handleToggleActive = async (svc) => {
    // optimistic update
    setServices((prev) =>
      prev.map((s) => (s.id === svc.id ? { ...s, active: !s.active } : s)),
    );
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/quick-services/${svc.id}/toggle-active`,
        { method: "PATCH", headers: authHeaders() },
      );
      if (!res.ok) throw new Error(`Toggle failed (${res.status})`);
    } catch (e) {
      console.error(e);
      setError("Couldn't update status — reverting.");
      loadServices();
    }
  };

  // --- Drag to reorder ---

  const handleDragStart = (index) => setDragIndex(index);

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setServices((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dirtyOrderRef.current = true;
    setDragIndex(index);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    if (!dirtyOrderRef.current) return;
    dirtyOrderRef.current = false;

    const items = services.map((s, i) => ({ id: s.id, displayOrder: i }));
    try {
      const res = await fetch(`${BASE_URL}/api/admin/quick-services/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
    } catch (e) {
      console.error(e);
      setError("Couldn't save the new order — reloading.");
      loadServices();
    }
  };

  // Nudge with buttons too, for accessibility / non-drag reordering.
  const moveService = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    setServices((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
    dirtyOrderRef.current = true;
    await handleDragEnd();
  };

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
    else setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="qs-shell-backdrop" onClick={handleClose}>
      <div className="qs-shell-card" onClick={(e) => e.stopPropagation()}>
        <div className="qs-shell-sticky">
          <div className="qs-shell-header">
            <div>
              <h1 className="qs-admin-title">Quick Services</h1>
              <p className="qs-admin-subtitle">
                These are the shortcut cards shown near the top of the home page.
              </p>
            </div>
            <button
              type="button"
              className="qs-shell-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="qs-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`qs-tab-btn ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="qs-admin">
      {error && <div className="qs-error-banner">{error}</div>}

      {/* Tab: Add */}
      {activeTab === "add" && (
      <section className="qs-section qs-section-dialog">
        <div className="qs-section-heading">
          <h2 className="qs-section-title">Add a quick service</h2>
          <p className="qs-section-desc">
            Create a new shortcut card. It's added to the end of the list —
            reorder it below once it's saved.
          </p>
        </div>

        <form className="qs-add-form" onSubmit={handleAddSubmit}>
          <IconPicker
            value={addForm.icon}
            onChange={(icon) => setAddForm((f) => ({ ...f, icon }))}
            onError={setError}
          />

          <div className="qs-add-form-row">
            <div className="qs-add-form-col">
              <label className="qs-field-label" htmlFor="qs-add-label">
                Name
              </label>
              <input
                id="qs-add-label"
                className="qs-field-input"
                type="text"
                value={addForm.label}
                onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Kisan Mitra"
                required
              />
            </div>

            <div className="qs-add-form-col">
              <label className="qs-field-label" htmlFor="qs-add-path">
                Page it opens
              </label>
              <input
                id="qs-add-path"
                className="qs-field-input"
                type="text"
                value={addForm.path}
                onChange={(e) => setAddForm((f) => ({ ...f, path: e.target.value }))}
                placeholder="/job-board"
                required
              />
            </div>
          </div>

          <label className="qs-field-label" htmlFor="qs-add-sub">
            Description
          </label>
          <input
            id="qs-add-sub"
            className="qs-field-input"
            type="text"
            value={addForm.sub}
            onChange={(e) => setAddForm((f) => ({ ...f, sub: e.target.value }))}
            placeholder="Short line shown under the name"
          />

          <div className="qs-add-form-footer">
            <label className="qs-toggle-row">
              <span className="qs-toggle-switch">
                <input
                  type="checkbox"
                  checked={addForm.active}
                  onChange={(e) => setAddForm((f) => ({ ...f, active: e.target.checked }))}
                />
                <span className="qs-toggle-track">
                  <span className="qs-toggle-thumb" />
                </span>
              </span>
              <span className="qs-toggle-label">Show on the home page</span>
            </label>
            <button type="submit" className="qs-btn-primary" disabled={adding}>
              {adding ? "Adding…" : "+ Add service"}
            </button>
          </div>
        </form>
      </section>
      )}

      {/* Tab: Manage / reorder / remove */}
      {activeTab === "manage" && (
      <section className="qs-section">
        <div className="qs-section-heading">
          <h2 className="qs-section-title">Manage &amp; reorder</h2>
          <p className="qs-section-desc">
            Drag a row (or use the arrows) to change where it appears on the
            home page. Toggle visibility, edit details, or remove a card.
          </p>
        </div>

        {loading ? (
          <div className="qs-empty-state">Loading…</div>
        ) : services.length === 0 ? (
          <div className="qs-empty-state">
            No quick services yet. Add one above to show it on the home page.
          </div>
        ) : (
          <div className="qs-table">
            <div className="qs-table-head">
              <span className="qs-col-drag" />
              <span className="qs-col-icon">Icon</span>
              <span className="qs-col-name">Name &amp; description</span>
              <span className="qs-col-path">Links to</span>
              <span className="qs-col-status">Status</span>
              <span className="qs-col-actions">Actions</span>
            </div>
            {services.map((svc, index) => (
              <div
                key={svc.id}
                className={`qs-row ${dragIndex === index ? "qs-row-dragging" : ""}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDragEnd={handleDragEnd}
              >
                <span className="qs-col-drag qs-drag-cell">
                  <span className="qs-drag-handle" title="Drag to reorder">
                    ⠿
                  </span>
                  <span className="qs-reorder-arrows">
                    <button
                      type="button"
                      className="qs-arrow-btn"
                      disabled={index === 0}
                      onClick={() => moveService(index, -1)}
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="qs-arrow-btn"
                      disabled={index === services.length - 1}
                      onClick={() => moveService(index, 1)}
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </span>
                </span>
                <span className="qs-col-icon qs-icon-preview">
                  {isImageIcon(svc.icon) ? (
                    <img src={svc.icon} alt="" className="qs-icon-img" />
                  ) : (
                    svc.icon
                  )}
                </span>
                <span className="qs-col-name">
                  <div className="qs-row-label">{svc.label}</div>
                  {svc.sub && <div className="qs-row-sub">{svc.sub}</div>}
                </span>
                <span className="qs-col-path qs-row-path">{svc.path}</span>
                <span className="qs-col-status">
                  <button
                    className={`qs-status-toggle ${svc.active ? "is-active" : "is-inactive"}`}
                    onClick={() => handleToggleActive(svc)}
                  >
                    {svc.active ? "Live" : "Hidden"}
                  </button>
                </span>
                <span className="qs-col-actions qs-row-actions">
                  <button className="qs-btn-link" onClick={() => openEdit(svc)}>
                    Edit
                  </button>
                  <button
                    className="qs-btn-link qs-btn-danger"
                    onClick={() => handleDelete(svc)}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      )}
        </div>
      </div>

      {editingId != null && (
        <div className="qs-modal-overlay" onClick={closeEdit}>
          <div className="qs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qs-modal-header">
              <h2 className="qs-modal-title">Edit service</h2>
              <button
                type="button"
                className="qs-modal-cancel-sticky"
                onClick={closeEdit}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <IconPicker
                value={editForm.icon}
                onChange={(icon) => setEditForm((f) => ({ ...f, icon }))}
                onError={setError}
              />

              <label className="qs-field-label" htmlFor="qs-edit-label">
                Name
              </label>
              <input
                id="qs-edit-label"
                className="qs-field-input"
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Kisan Mitra"
                required
              />

              <label className="qs-field-label" htmlFor="qs-edit-sub">
                Description
              </label>
              <input
                id="qs-edit-sub"
                className="qs-field-input"
                type="text"
                value={editForm.sub}
                onChange={(e) => setEditForm((f) => ({ ...f, sub: e.target.value }))}
                placeholder="Short line shown under the name"
              />

              <label className="qs-field-label" htmlFor="qs-edit-path">
                Page it opens
              </label>
              <input
                id="qs-edit-path"
                className="qs-field-input"
                type="text"
                value={editForm.path}
                onChange={(e) => setEditForm((f) => ({ ...f, path: e.target.value }))}
                placeholder="/job-board"
                required
              />

              <label className="qs-toggle-row">
                <span className="qs-toggle-switch">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) => setEditForm((f) => ({ ...f, active: e.target.checked }))}
                  />
                  <span className="qs-toggle-track">
                    <span className="qs-toggle-thumb" />
                  </span>
                </span>
                <span className="qs-toggle-label">Show on the home page</span>
              </label>

              <div className="qs-modal-actions">
                <button type="submit" className="qs-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
