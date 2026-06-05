import React, { useState, useEffect, useCallback } from "react";
import "./mediapress-admin.css";

const API_BASE = "http://smartgaonadmin.duckdns.org:9090/api/admin/media-gallery";

const text = {
  title: "Media & Press",
  subtitle: "Manage featured coverage, press articles, videos, and media logos.",
  featured: "Featured",
  press: "Press Articles",
  videos: "Video Coverage",
  logos: "Media Logos",
  featuredArticle: "Featured Article",
  videoCoverage: "Video Coverage",
  mediaLogos: "Media Logos",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  view: "View",
  cancel: "Cancel",
  save: "Save",
  confirmDelete: "Are you sure you want to delete this item?",
};

const TABS = [
  { key: "featured", label: text.featured },
  { key: "press", label: text.press },
  { key: "video", label: text.videos },
  { key: "logo", label: text.logos },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  // Shorts: https://youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  // Watch: https://youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return null;
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

// ─── API Helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const authHeader = token
    ? (token.startsWith("Bearer ") ? token : "Bearer " + token)
    : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const body = await res.text();
      if (body) msg += " — " + body;
    } catch (_) {}
    throw new Error(msg);
  }
  if (options.method === "DELETE") return null;
  const txt = await res.text();
  if (!txt) return null;
  return JSON.parse(txt);
}

function mapFromApi(item) {
  let date = "", duration = "", channelTag = "", summary = item.description || "";
  if (item.description && item.description.startsWith("__meta::")) {
    try {
      const metaEnd = item.description.indexOf("::/meta::");
      if (metaEnd !== -1) {
        const meta = JSON.parse(item.description.slice(8, metaEnd));
        date = meta.date || "";
        duration = meta.duration || "";
        channelTag = meta.channelTag || "";
        summary = item.description.slice(metaEnd + 9);
      }
    } catch (_) {
      summary = item.description || "";
    }
  }
  return {
    id: item.id,
    title: item.title || "",
    source: item.sourceName || "",
    channel: item.sourceName || "",
    type: item.mediaType || "newspaper",
    category: item.category || "",
    summary,
    image: item.thumbnailUrl || "",
    icon: item.thumbnailUrl || "",
    link: item.mediaUrl || "",
    name: item.title || "",
    active: item.active ?? true,
    date,
    duration,
    channelTag,
  };
}

function mapToApi(values, category) {
  const hasMeta = values.date || values.duration || values.channelTag;
  let description = values.summary || values.desc || "";
  if (hasMeta) {
    const meta = JSON.stringify({
      date: values.date || "",
      duration: values.duration || "",
      channelTag: values.channelTag || "",
    });
    description = "__meta::" + meta + "::/meta::" + description;
  }
  return {
    title: values.title || values.name || "",
    category: category,
    mediaType: values.type || category,
    sourceName: values.source || values.channel || "",
    description,
    mediaUrl: values.link || "",
    thumbnailUrl: values.image || values.thumb || values.icon || "",
    active: values.active !== undefined ? values.active : true,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MediaPressAdminPage() {
  const [activeTab, setActiveTab] = useState("featured");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const fetchByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/category/" + category);
      setItems((data || []).map(mapFromApi));
    } catch (err) {
      setError("Failed to load data. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchByCategory(activeTab);
  }, [activeTab, fetchByCategory]);

  const openAddForm = () => { setEditingItem(null); setIsFormOpen(true); };
  const openEditForm = (item) => { setEditingItem(item); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };
  const openView = (item) => setViewingItem(item);
  const closeView = () => setViewingItem(null);

  const handleDelete = async (id) => {
    if (!window.confirm(text.confirmDelete)) return;
    try {
      await apiFetch("/" + id, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Delete failed. Please try again.");
    }
  };

  const handleFormSubmit = async (values) => {
    const payload = mapToApi(values, activeTab);
    try {
      if (editingItem) {
        const updated = await apiFetch("/" + editingItem.id, {
          method: "PUT",
          body: JSON.stringify({ ...payload, id: editingItem.id }),
        });
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? mapFromApi(updated) : i)));
      } else {
        const created = await apiFetch("", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => [...prev, mapFromApi(created)]);
      }
      closeForm();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const payload = mapToApi(item, activeTab);
      payload.active = !item.active;
      const updated = await apiFetch("/" + item.id, {
        method: "PUT",
        body: JSON.stringify({ ...payload, id: item.id }),
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? mapFromApi(updated) : i)));
    } catch {
      alert("Toggle failed. Please try again.");
    }
  };

  const featuredItem = activeTab === "featured" ? items[0] || null : null;

  return (
    <div className="mp-admin-wrapper">
      <div className="mp-admin-container">

        <div className="mp-admin-header">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
        </div>

        <div className="mp-admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={"mp-admin-tab-btn" + (activeTab === tab.key ? " active" : "")}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="mp-admin-error">{error}</div>}

        {loading ? (
          <div className="mp-admin-loading">Loading...</div>
        ) : (
          <>
            {/* ── FEATURED ── */}
            {activeTab === "featured" && (
              <section className="mp-admin-section">
                <div className="mp-admin-section-header">
                  <h2>{text.featuredArticle}</h2>
                  <button type="button" className="mp-admin-add-btn"
                    onClick={featuredItem ? () => openEditForm(featuredItem) : openAddForm}>
                    {featuredItem ? text.edit : text.add}
                  </button>
                </div>

                {featuredItem ? (
                  <div className="mp-admin-card">
                    {featuredItem.image && (
                      <div className="mp-admin-card-thumb">
                        <img src={featuredItem.image} alt={featuredItem.title} />
                      </div>
                    )}
                    <div className="mp-admin-card-main">
                      <strong>{featuredItem.title}</strong>
                      <p className="mp-admin-small">{featuredItem.source} · {featuredItem.date}</p>
                      <p className="mp-admin-small">{featuredItem.summary}</p>
                      {featuredItem.link && (
                        <p className="mp-admin-small">
                          <a href={featuredItem.link} target="_blank" rel="noreferrer" className="mp-admin-link">
                            {featuredItem.link}
                          </a>
                        </p>
                      )}
                      <ActiveBadge active={featuredItem.active} />
                    </div>
                    <div className="mp-admin-card-actions">
                      <button type="button" className="mp-admin-action-btn view" onClick={() => openView(featuredItem)}>
                        {text.view}
                      </button>
                      <button type="button" className="mp-admin-action-btn" onClick={() => openEditForm(featuredItem)}>
                        {text.edit}
                      </button>
                      <button type="button"
                        className={"mp-admin-action-btn " + (featuredItem.active ? "toggle-off" : "toggle-on")}
                        onClick={() => handleToggleActive(featuredItem)}>
                        {featuredItem.active ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="mp-admin-action-btn danger"
                        onClick={() => handleDelete(featuredItem.id)}>
                        {text.delete}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mp-admin-empty">No featured article added yet.</p>
                )}
              </section>
            )}

            {/* ── PRESS ── */}
            {activeTab === "press" && (
              <AdminTable
                title={text.press}
                columns={["Title", "Source", "Date", "Type", "Status", "Actions"]}
                emptyText="No press articles added yet."
                items={items}
                onAdd={openAddForm}
                renderRow={(item) => (
                  <div key={item.id} className="mp-admin-table-row press-row">
                    <div className="mp-admin-cell-truncate">{item.title}</div>
                    <div>{item.source}</div>
                    <div>{item.date}</div>
                    <div>{item.type}</div>
                    <div><ActiveBadge active={item.active} /></div>
                    <ActionButtons
                      onView={() => openView(item)}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => handleDelete(item.id)}
                      onToggle={() => handleToggleActive(item)}
                      active={item.active}
                    />
                  </div>
                )}
              />
            )}

            {/* ── VIDEOS ── */}
            {activeTab === "video" && (
              <AdminTable
                title={text.videoCoverage}
                columns={["Title", "Channel", "Date", "Duration", "Status", "Actions"]}
                emptyText="No video coverage added yet."
                items={items}
                onAdd={openAddForm}
                renderRow={(item) => (
                  <div key={item.id} className="mp-admin-table-row video-row">
                    <div className="mp-admin-cell-truncate">{item.title}</div>
                    <div>{item.channel}</div>
                    <div>{item.date}</div>
                    <div>{item.duration}</div>
                    <div><ActiveBadge active={item.active} /></div>
                    <ActionButtons
                      onView={() => openView(item)}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => handleDelete(item.id)}
                      onToggle={() => handleToggleActive(item)}
                      active={item.active}
                    />
                  </div>
                )}
              />
            )}

            {/* ── LOGOS ── */}
            {activeTab === "logo" && (
              <AdminTable
                title={text.mediaLogos}
                columns={["Preview", "Name", "Status", "Actions"]}
                emptyText="No media logos added yet."
                items={items}
                onAdd={openAddForm}
                tableClassName="mp-admin-table logos"
                renderRow={(item) => (
                  <div key={item.id} className="mp-admin-table-row logo-row">
                    <div>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="mp-admin-logo-thumb" />
                      ) : (
                        <span className="mp-admin-logo-placeholder">{item.name?.[0] || "L"}</span>
                      )}
                    </div>
                    <div>{item.name}</div>
                    <div><ActiveBadge active={item.active} /></div>
                    <ActionButtons
                      onView={() => openView(item)}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => handleDelete(item.id)}
                      onToggle={() => handleToggleActive(item)}
                      active={item.active}
                    />
                  </div>
                )}
              />
            )}
          </>
        )}
      </div>

      {isFormOpen && (
        <MediaPressAdminForm
          type={activeTab}
          initialData={editingItem}
          onCancel={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {viewingItem && (
        <ViewModal
          item={viewingItem}
          type={activeTab}
          onClose={closeView}
        />
      )}
    </div>
  );
}

// ─── ActiveBadge ───────────────────────────────────────────────────────────────

function ActiveBadge({ active }) {
  return (
    <span className={"mp-admin-badge " + (active ? "badge-active" : "badge-inactive")}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── AdminTable ────────────────────────────────────────────────────────────────

function AdminTable({ title, columns, emptyText, items, onAdd, renderRow, tableClassName }) {
  return (
    <section className="mp-admin-section">
      <div className="mp-admin-section-header">
        <h2>{title}</h2>
        <button type="button" className="mp-admin-add-btn" onClick={onAdd}>
          {text.add}
        </button>
      </div>
      <div className={tableClassName || "mp-admin-table"}>
        <div className="mp-admin-table-header">
          {columns.map((col) => <div key={col}>{col}</div>)}
        </div>
        {items.map(renderRow)}
        {items.length === 0 && <div className="mp-admin-empty-row">{emptyText}</div>}
      </div>
    </section>
  );
}

// ─── ActionButtons ─────────────────────────────────────────────────────────────

function ActionButtons({ onView, onEdit, onDelete, onToggle, active }) {
  return (
    <div className="mp-admin-action-group">
      <button type="button" className="mp-admin-action-btn view" onClick={onView}>
        {text.view}
      </button>
      <button type="button" className="mp-admin-action-btn" onClick={onEdit}>
        {text.edit}
      </button>
      <button type="button"
        className={"mp-admin-action-btn " + (active ? "toggle-off" : "toggle-on")}
        onClick={onToggle}>
        {active ? "Deactivate" : "Activate"}
      </button>
      <button type="button" className="mp-admin-action-btn danger" onClick={onDelete}>
        {text.delete}
      </button>
    </div>
  );
}

// ─── ViewModal ─────────────────────────────────────────────────────────────────

function ViewModal({ item, type, onClose }) {
  const embedUrl = getYoutubeEmbedUrl(item.link);
  const isVideo = type === "video";
  const isLogo = type === "logo";
  const hasImage = !!item.image;
  const hasLink = !!item.link;

  return (
    <div className="mp-view-backdrop" onClick={onClose}>
      <div className="mp-view-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mp-view-header">
          <div className="mp-view-header-left">
            <ActiveBadge active={item.active} />
            <span className="mp-view-type-tag">{item.type || type}</span>
          </div>
          <button type="button" className="mp-admin-form-close" onClick={onClose}>✕</button>
        </div>

        {/* Media preview */}
        {isVideo && embedUrl ? (
          <div className="mp-view-video-wrap">
            <iframe
              src={embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isVideo && hasImage ? (
          <div className="mp-view-img-wrap">
            <img src={item.image} alt={item.title} />
          </div>
        ) : isLogo && hasImage ? (
          <div className="mp-view-logo-wrap">
            <img src={item.image} alt={item.name} />
          </div>
        ) : hasImage ? (
          <div className="mp-view-img-wrap">
            <img src={item.image} alt={item.title} />
          </div>
        ) : null}

        {/* Content */}
        <div className="mp-view-content">
          <h2 className="mp-view-title">{item.title || item.name}</h2>

          <div className="mp-view-meta">
            {(item.source || item.channel) && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">{isVideo ? "Channel" : "Source"}:</span>
                {item.source || item.channel}
              </span>
            )}
            {item.date && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">Date:</span>{item.date}
              </span>
            )}
            {item.duration && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">Duration:</span>{item.duration}
              </span>
            )}
            {item.channelTag && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">Tag:</span>{item.channelTag}
              </span>
            )}
          </div>

          {item.summary && (
            <p className="mp-view-summary">{item.summary}</p>
          )}

          {hasLink && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mp-view-link-btn"
            >
              {isVideo ? "Watch on YouTube" : "Read Article"} ↗
            </a>
          )}

          {/* Image URL preview for logo/image */}
          {hasImage && !isVideo && (
            <div className="mp-view-url-row">
              <span className="mp-view-meta-label">Image URL:</span>
              <a href={item.image} target="_blank" rel="noreferrer" className="mp-admin-link mp-view-url-text">
                {item.image}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mp-view-footer">
          <button type="button" className="mp-admin-form-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form ──────────────────────────────────────────────────────────────────────

function MediaPressAdminForm({ type, initialData, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(() => {
    if (initialData) return { ...initialData };
    return {
      title: "", source: "", type: "newspaper", summary: "",
      image: "", date: "", link: "", channel: "",
      channelTag: "", duration: "", name: "", icon: "", active: true,
    };
  });

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const isFeatured = type === "featured";
  const isPress = type === "press";
  const isVideo = type === "video";
  const isLogo = type === "logo";

  return (
    <div className="mp-admin-form-backdrop" onClick={onCancel}>
      <div className="mp-admin-form-box" onClick={(e) => e.stopPropagation()}>
        <div className="mp-admin-form-header">
          <h3>{initialData ? "Edit Item" : "Add Item"}</h3>
          <button type="button" className="mp-admin-form-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mp-admin-form">

          {(isFeatured || isPress || isVideo) && (
            <>
              <label className="mp-admin-label">
                Title
                <input type="text" value={formValues.title || ""} onChange={handleChange("title")} required />
              </label>

              {isPress && (
                <label className="mp-admin-label">
                  Type
                  <select value={formValues.type || "newspaper"} onChange={handleChange("type")}>
                    <option value="newspaper">Newspaper</option>
                    <option value="magazine">Magazine</option>
                  </select>
                </label>
              )}

              <label className="mp-admin-label">
                {isVideo ? "Channel" : "Source"}
                <input
                  type="text"
                  value={isVideo ? formValues.channel || "" : formValues.source || ""}
                  onChange={handleChange(isVideo ? "channel" : "source")}
                  required
                />
              </label>

              <label className="mp-admin-label">
                Date
                <input type="text" value={formValues.date || ""} onChange={handleChange("date")} placeholder="June 1, 2026" />
              </label>

              {isVideo && (
                <>
                  <label className="mp-admin-label">
                    Duration
                    <input type="text" value={formValues.duration || ""} onChange={handleChange("duration")} placeholder="12:34" />
                  </label>
                  <label className="mp-admin-label">
                    Channel Tag
                    <input type="text" value={formValues.channelTag || ""} onChange={handleChange("channelTag")} placeholder="DD NEWS" />
                  </label>
                </>
              )}

              <label className="mp-admin-label">
                {isVideo ? "Thumbnail URL" : "Image URL"}
                <input
                  type="text"
                  value={formValues.image || ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value, thumb: e.target.value }))}
                  placeholder="https://..."
                />
              </label>

              <label className="mp-admin-label">
                {isVideo ? "YouTube / Shorts URL" : "Article Link"}
                <input type="text" value={formValues.link || ""} onChange={handleChange("link")} placeholder="https://youtube.com/..." />
              </label>

              <label className="mp-admin-label">
                {isVideo ? "Description" : "Summary"}
                <textarea
                  value={formValues.summary || ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, summary: e.target.value, desc: e.target.value }))}
                  rows={3}
                />
              </label>
            </>
          )}

          {isLogo && (
            <>
              <label className="mp-admin-label">
                Logo Name
                <input type="text" value={formValues.name || formValues.title || ""} onChange={handleChange("name")} required />
              </label>
              <label className="mp-admin-label">
                Logo Image URL
                <input type="text" value={formValues.image || formValues.icon || ""} onChange={handleChange("image")} placeholder="https://..." />
              </label>
              <label className="mp-admin-label">
                Website Link
                <input type="text" value={formValues.link || ""} onChange={handleChange("link")} placeholder="https://..." />
              </label>
            </>
          )}

          <label className="mp-admin-label mp-admin-label-row">
            <span>Active</span>
            <input
              type="checkbox"
              checked={formValues.active ?? true}
              onChange={(e) => setFormValues((prev) => ({ ...prev, active: e.target.checked }))}
              className="mp-admin-checkbox"
            />
          </label>

          <div className="mp-admin-form-actions">
            <button type="button" className="mp-admin-form-btn secondary" onClick={onCancel}>
              {text.cancel}
            </button>
            <button type="submit" className="mp-admin-form-btn primary">
              {text.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
