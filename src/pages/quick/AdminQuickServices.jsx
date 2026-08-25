import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../myvillage/services/config";
import "./AdminQuickServices.css";

const ICON_PRESETS = [
  "🏆",
  "💼",
  "📜",
  "🌾",
  "🏥",
  "💛",
  "🧠",
  "📡",
  "🎓",
  "🏛",
  "🩺",
  "🌦",
  "❤",
  "📍",
  "🛒",
  "🚜",
  "🐄",
  "💧",
];

const EMPTY_FORM = {
  icon: "🏆",
  label: "",
  sub: "",
  path: "",
  active: true,
  isCustom: true,
};

const PLATFORM_TABS = [
  {
    id: "web",
    label: "🌐 WEB Services",
    api: `${BASE_URL}/api/admin/quick-services`,
  },
  {
    id: "mob",
    label: "📱 MOB Services",
    api: `${BASE_URL}/api/admin/quick-services/mob`,
  },
];

const TABS = [
  { id: "add", label: "Add Service" },
  { id: "manage", label: "Manage & Reorder" },
];

const isImageIcon = (icon) =>
  typeof icon === "string" && icon.startsWith("data:image");

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
            .catch(() =>
              onError?.("Couldn't read that pasted image. Try again."),
            );
          return;
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [onChange, onError]);

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
              <img
                src={value}
                alt="Selected icon"
                className="qs-icon-swatch-img"
              />
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
              placeholder="✏"
              aria-label="Custom icon"
            />
          )}
        </div>
        <span className="qs-icon-hint">
          Type an emoji here, or copy any image and press{" "}
          <strong>Ctrl/Cmd+V</strong>
        </span>
      </div>
    </div>
  );
}

export default function AdminQuickServices({ onClose } = {}) {
  const [visible, setVisible] = useState(true);
  const [platform, setPlatform] = useState("web");
  const [activeTab, setActiveTab] = useState("add");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const dirtyOrderRef = useRef(false);

  const currentApi = PLATFORM_TABS.find((p) => p.id === platform)?.api;

  const authHeaders = () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...authHeaders(),
  });

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      console.log(`[LOAD ${platform.toUpperCase()}]`, currentApi);
      const res = await fetch(currentApi, {
        headers: authHeaders(),
      });
      if (!res.ok)
        throw new Error(`Failed to load ${platform} (${res.status})`);
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(
        `Couldn't load ${platform.toUpperCase()} services. ${e.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [platform]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.label.trim() || !addForm.path.trim()) {
      setError("Name and page path are required.");
      return;
    }
    setAdding(true);
    setError("");
    const payload = {
      icon: addForm.icon,
      label: addForm.label,
      sub: addForm.sub,
      path: addForm.path,
      active: addForm.active,
    };

    try {
      console.log(`[ADD ${platform.toUpperCase()}]`, currentApi, payload);
      const res = await fetch(currentApi, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save failed (${res.status})`);
      }
      await loadServices();
      setAddForm(EMPTY_FORM);
      setActiveTab("manage");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

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
    setSaving(true);
    setError("");
    const payload = {
      icon: editForm.icon,
      label: editForm.label,
      sub: editForm.sub,
      path: editForm.path,
      active: editForm.active,
    };
    try {
      const res = await fetch(`${currentApi}/${editingId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await loadServices();
      closeEdit();
    } catch (e) {
      console.error(e);
      setError("Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (svc) => {
    if (
      !window.confirm(`Remove "${svc.label}" from ${platform.toUpperCase()}?`)
    )
      return;
    try {
      const res = await fetch(`${currentApi}/${svc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      if (editingId === svc.id) closeEdit();
    } catch (e) {
      console.error(e);
      setError("Couldn't remove.");
    }
  };

  const handleToggleActive = async (svc) => {
    setServices((prev) =>
      prev.map((s) => (s.id === svc.id ? { ...s, active: !s.active } : s)),
    );
    try {
      const res = await fetch(`${currentApi}/${svc.id}/toggle-active`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Toggle failed (${res.status})`);
    } catch (e) {
      console.error(e);
      setError("Couldn't update status — reverting.");
      loadServices();
    }
  };

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
      const res = await fetch(`${currentApi}/reorder`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
    } catch (e) {
      console.error(e);
      setError("Couldn't save the new order — reloading.");
      loadServices();
    }
  };
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
                These are the shortcut cards shown near the top of the home
                page.
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
          <div
            className="qs-tabs"
            style={{
              background: "#e2e8f0",
              padding: "5px",
              borderRadius: "12px",
              gap: "5px",
            }}
          >
            {PLATFORM_TABS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`qs-tab-btn ${platform === p.id ? "is-active" : ""}`}
                onClick={() => setPlatform(p.id)}
                style={{
                  flex: 1,
                  background: platform === p.id ? "white" : "transparent",
                  boxShadow:
                    platform === p.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {p.label}
              </button>
            ))}
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
          {activeTab === "add" && (
            <section className="qs-section qs-section-dialog">
              <div className="qs-section-heading">
                <h2 className="qs-section-title">Add a quick service</h2>
                <p className="qs-section-desc">
                  Create a new shortcut card. It's added to the end of the list
                  — reorder it below once it's saved.
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
                    <label className="qs-field-label">Name</label>
                    <input
                      className="qs-field-input"
                      type="text"
                      value={addForm.label}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, label: e.target.value }))
                      }
                      placeholder="e.g. Kisan Mitra"
                      required
                    />
                  </div>
                  <div className="qs-add-form-col">
                    <label className="qs-field-label">Page it opens</label>
                    <input
                      className="qs-field-input"
                      type="text"
                      value={addForm.path}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, path: e.target.value }))
                      }
                      placeholder="/job-board"
                      required
                    />
                  </div>
                </div>
                <label className="qs-field-label">Description</label>
                <input
                  className="qs-field-input"
                  type="text"
                  value={addForm.sub}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, sub: e.target.value }))
                  }
                  placeholder="Short line shown under the name"
                />
                <div className="qs-add-form-footer">
                  <label className="qs-toggle-row">
                    <span className="qs-toggle-switch">
                      <input
                        type="checkbox"
                        checked={addForm.active}
                        onChange={(e) =>
                          setAddForm((f) => ({
                            ...f,
                            active: e.target.checked,
                          }))
                        }
                      />
                      <span className="qs-toggle-track">
                        <span className="qs-toggle-thumb" />
                      </span>
                    </span>
                    <span className="qs-toggle-label">
                      Show on the home page
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="qs-btn-primary"
                    disabled={adding}
                  >
                    {adding ? "Adding…" : `+ Add to ${platform.toUpperCase()}`}
                  </button>
                </div>
              </form>
            </section>
          )}
          {activeTab === "manage" && (
            <section className="qs-section">
              <div className="qs-section-heading">
                <h2 className="qs-section-title">
                  Manage {platform.toUpperCase()} - {services.length} items
                </h2>
              </div>
              {loading ? (
                <div className="qs-empty-state">
                  Loading {platform.toUpperCase()}…
                </div>
              ) : services.length === 0 ? (
                <div className="qs-empty-state">
                  No {platform.toUpperCase()} services yet.
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
                        <span className="qs-drag-handle">⠿</span>
                        <span className="qs-reorder-arrows">
                          <button
                            type="button"
                            className="qs-arrow-btn"
                            disabled={index === 0}
                            onClick={() => moveService(index, -1)}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="qs-arrow-btn"
                            disabled={index === services.length - 1}
                            onClick={() => moveService(index, 1)}
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
                      <span className="qs-col-path qs-row-path">
                        {svc.path}
                      </span>
                      <span className="qs-col-status">
                        <button
                          className={`qs-status-toggle ${svc.active ? "is-active" : "is-inactive"}`}
                          onClick={() => handleToggleActive(svc)}
                        >
                          {svc.active ? "Live" : "Hidden"}
                        </button>
                      </span>
                      <span className="qs-col-actions qs-row-actions">
                        <button
                          className="qs-btn-link"
                          onClick={() => openEdit(svc)}
                        >
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
              <h2 className="qs-modal-title">
                Edit {platform.toUpperCase()} service
              </h2>
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
              <label className="qs-field-label">Name</label>
              <input
                className="qs-field-input"
                type="text"
                value={editForm.label}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, label: e.target.value }))
                }
                required
              />
              <label className="qs-field-label">Description</label>
              <input
                className="qs-field-input"
                type="text"
                value={editForm.sub}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, sub: e.target.value }))
                }
              />
              <label className="qs-field-label">Page it opens</label>
              <input
                className="qs-field-input"
                type="text"
                value={editForm.path}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, path: e.target.value }))
                }
                required
              />
              <div className="qs-modal-actions">
                <button
                  type="submit"
                  className="qs-btn-primary"
                  disabled={saving}
                >
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
