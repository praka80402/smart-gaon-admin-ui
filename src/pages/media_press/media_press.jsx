import React, { useState, useEffect, useCallback } from "react";
import "./mediapress-admin.css";

// Admin base (write + read)
const ADMIN_API_BASE = "https://smartgaonadmin.duckdns.org/api/admin/media-gallery";

// Public base (read-only, from PDF)
const PUBLIC_API_BASE = "/api/media-gallery"; // relative, will hit same origin backend

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

// Only Press + Video tabs
const TABS = [
  { key: "press", label: text.press },
  { key: "video", label: text.videos },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return null;
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

// ─── Generic fetch helpers ─────────────────────────────────────────────────────

async function adminApiFetch(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : "Bearer " + token
    : null;

  const res = await fetch(`${ADMIN_API_BASE}${path}`, {
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

// Public read-only APIs from PDF: list, details, filters, search, pagination [file:19]
async function publicApiFetch(path, options = {}) {
  const res = await fetch(`${PUBLIC_API_BASE}${path}`, {
    ...options,
  });

  if (!res.ok) {
    let msg = `Public API error: ${res.status}`;
    try {
      const body = await res.text();
      if (body) msg += " — " + body;
    } catch (_) {}
    throw new Error(msg);
  }

  const txt = await res.text();
  if (!txt) return null;
  return JSON.parse(txt);
}

// ─── Mapping between API <-> UI ────────────────────────────────────────────────

// PDF entity structure is: id, title, category, mediaType, sourceName, description,
// mediaUrl, thumbnailUrl, active  [file:19]
function mapFromApi(item) {
  let date = "",
    duration = "",
    channelTag = "",
    summary = item.description || "";

  // Admin-only meta wrapper support
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

// For admin create/update using same fields PDF backend exposes [file:19]
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
    id: values.id,
    title: values.title || values.name || "",
    category: category || values.category || "",
    mediaType: values.type || category || "",
    sourceName: values.source || values.channel || "",
    description,
    mediaUrl: values.link || "",
    thumbnailUrl: values.image || values.thumb || values.icon || "",
    active: values.active !== undefined ? values.active : true,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MediaPressAdminPage() {
  const [activeTab, setActiveTab] = useState("press");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Optional: hooks for pagination/search/filters using public API [file:19]
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState(""); // IMAGE / VIDEO / YOUTUBE
  const [categoryFilter, setCategoryFilter] = useState(""); // e.g., "Video"

  // Decide category by tab (for admin & public)
  const getCategoryByTab = (tab) => {
    if (tab === "press") return "press";
    if (tab === "video") return "video";
    return "";
  };

  // Admin fetch by category (for your existing admin list)
  const fetchAdminByCategory = useCallback(
    async (categoryKey) => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApiFetch("/category/" + categoryKey);
        setItems((data || []).map(mapFromApi));
      } catch (err) {
        setError("Failed to load data. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Example: Public API list with pagination from PDF [file:19]
  const fetchPublicList = useCallback(
    async (categoryKey) => {
      setLoading(true);
      setError(null);
      try {
        const cat = getCategoryByTab(categoryKey);
        let path = `?page=${page}&size=${size}`; // GET /api/media-gallery?page=0&size=5

        if (searchTitle) {
          // GET /api/media-gallery/search?title=... [file:19]
          path = `/search?title=${encodeURIComponent(searchTitle)}`;
        } else if (categoryFilter || cat) {
          // GET /api/media-gallery/category/{category} [file:19]
          const chosen = categoryFilter || cat;
          path = `/category/${encodeURIComponent(chosen)}`;
        } else if (mediaTypeFilter) {
          // GET /api/media-gallery/media-type/{mediaType} [file:19]
          path = `/media-type/${encodeURIComponent(mediaTypeFilter)}`;
        }

        const data = await publicApiFetch(path);
        // Pagination shape from PDF: content, totalPages, totalElements, size, number [file:19]
        const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        setItems(list.map(mapFromApi));
        if (data && typeof data.totalPages === "number") {
          setTotalPages(data.totalPages);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        setError("Failed to load public data. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [page, size, searchTitle, categoryFilter, mediaTypeFilter]
  );

  // You can decide whether admin tab should use admin or public fetch.
  // Right now: admin category fetch is primary.
  useEffect(() => {
    fetchAdminByCategory(activeTab);
    // If later you want read-only to use public list instead, swap:
    // fetchPublicList(activeTab);
  }, [activeTab, fetchAdminByCategory]);

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
  const openEditForm = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };
  const openView = (item) => setViewingItem(item);
  const closeView = () => setViewingItem(null);

  const handleDelete = async (id) => {
    if (!window.confirm(text.confirmDelete)) return;
    try {
      await adminApiFetch("/" + id, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Delete failed. Please try again.");
    }
  };

  const handleFormSubmit = async (values) => {
    const payload = mapToApi(values, activeTab);
    try {
      if (editingItem) {
        const updated = await adminApiFetch("/" + editingItem.id, {
          method: "PUT",
          body: JSON.stringify({ ...payload, id: editingItem.id }),
        });
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? mapFromApi(updated) : i))
        );
      } else {
        const created = await adminApiFetch("", {
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
      const updated = await adminApiFetch("/" + item.id, {
        method: "PUT",
        body: JSON.stringify({ ...payload, id: item.id }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? mapFromApi(updated) : i))
      );
    } catch {
      alert("Toggle failed. Please try again.");
    }
  };

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
              className={
                "mp-admin-tab-btn" + (activeTab === tab.key ? " active" : "")
              }
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
            {/* PRESS */}
            {activeTab === "press" && (
  <AdminTable
    title={text.press}
    columns={["Title", "Source", "Type", "Status", "Actions"]}
    emptyText="No press articles added yet."
    items={items}
    onAdd={openAddForm}
    headerClassName="press-header"
    renderRow={(item) => (
      <div key={item.id} className="mp-admin-table-row press-row">
        <div className="mp-admin-cell-truncate">{item.title}</div>
        <div>{item.source}</div>
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
            {/* VIDEOS */}
      {activeTab === "video" && (
  <AdminTable
    title={text.videoCoverage}
    columns={["Title", "Channel", "Status", "Actions"]}
    emptyText="No video coverage added yet."
    items={items}
    onAdd={openAddForm}
    headerClassName="video-header"
    renderRow={(item) => (
      <div key={item.id} className="mp-admin-table-row video-row">
        <div className="mp-admin-cell-truncate">{item.title}</div>
        <div>{item.channel}</div>
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
        <ViewModal item={viewingItem} type={activeTab} onClose={closeView} />
      )}
    </div>
  );
}

// ─── ActiveBadge ───────────────────────────────────────────────────────────────

function ActiveBadge({ active }) {
  return (
    <span
      className={
        "mp-admin-badge " + (active ? "badge-active" : "badge-inactive")
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── AdminTable ────────────────────────────────────────────────────────────────

function AdminTable({ title, columns, emptyText, items, onAdd, renderRow, tableClassName, headerClassName }) {
  return (
    <section className="mp-admin-section">
      <div className="mp-admin-section-header">
        <h2>{title}</h2>
        <button type="button" className="mp-admin-add-btn" onClick={onAdd}>
          {text.add}
        </button>
      </div>
      <div className={tableClassName || "mp-admin-table"}>
        <div className={`mp-admin-table-header ${headerClassName || ""}`}>
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
      <button
        type="button"
        className="mp-admin-action-btn view"
        onClick={onView}
      >
        {text.view}
      </button>
      <button
        type="button"
        className="mp-admin-action-btn"
        onClick={onEdit}
      >
        {text.edit}
      </button>
      <button
        type="button"
        className={
          "mp-admin-action-btn " + (active ? "toggle-off" : "toggle-on")
        }
        onClick={onToggle}
      >
        {active ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        className="mp-admin-action-btn danger"
        onClick={onDelete}
      >
        {text.delete}
      </button>
    </div>
  );
}

// ─── ViewModal ─────────────────────────────────────────────────────────────────

function ViewModal({ item, type, onClose }) {
  const embedUrl = getYoutubeEmbedUrl(item.link);
  const isVideo = type === "video";
  const hasImage = !!item.image;
  const hasLink = !!item.link;

  return (
    <div className="mp-view-backdrop" onClick={onClose}>
      <div
        className="mp-view-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-view-header">
          <div className="mp-view-header-left">
            <ActiveBadge active={item.active} />
            <span className="mp-view-type-tag">
              {item.type || type}
            </span>
          </div>
          <button
            type="button"
            className="mp-admin-form-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

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
        ) : hasImage ? (
          <div className="mp-view-img-wrap">
            <img src={item.image} alt={item.title} />
          </div>
        ) : null}

        <div className="mp-view-content">
          <h2 className="mp-view-title">
            {item.title || item.name}
          </h2>

          <div className="mp-view-meta">
            {(item.source || item.channel) && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">
                  {isVideo ? "Channel" : "Source"}:
                </span>
                {item.source || item.channel}
              </span>
            )}
            {item.channelTag && (
              <span className="mp-view-meta-item">
                <span className="mp-view-meta-label">
                  Tag:
                </span>
                {item.channelTag}
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

          {hasImage && !isVideo && (
            <div className="mp-view-url-row">
              <span className="mp-view-meta-label">
                Image URL:
              </span>
              <a
                href={item.image}
                target="_blank"
                rel="noreferrer"
                className="mp-admin-link mp-view-url-text"
              >
                {item.image}
              </a>
            </div>
          )}
        </div>

        <div className="mp-view-footer">
          <button
            type="button"
            className="mp-admin-form-btn secondary"
            onClick={onClose}
          >
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
      id: undefined,
      title: "",
      source: "",
      type: "newspaper",
      summary: "",
      image: "",
      date: "",
      link: "",
      channel: "",
      channelTag: "",
      duration: "",
      name: "",
      icon: "",
      active: true,
    };
  });

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const isPress = type === "press";
  const isVideo = type === "video";

  return (
    <div className="mp-admin-form-backdrop" onClick={onCancel}>
      <div
        className="mp-admin-form-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-admin-form-header">
          <h3>{initialData ? "Edit Item" : "Add Item"}</h3>
          <button
            type="button"
            className="mp-admin-form-close"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mp-admin-form">
          {(isPress || isVideo) && (
            <>
              <label className="mp-admin-label">
                Title
                <input
                  type="text"
                  value={formValues.title || ""}
                  onChange={handleChange("title")}
                  required
                />
              </label>

              {isPress && (
                <label className="mp-admin-label">
                  Type
                  <select
                    value={formValues.type || "newspaper"}
                    onChange={handleChange("type")}
                  >
                    <option value="newspaper">Newspaper</option>
                    <option value="magazine">Magazine</option>
                  </select>
                </label>
              )}

              <label className="mp-admin-label">
                {isVideo ? "Channel" : "Source"}
                <input
                  type="text"
                  value={
                    isVideo
                      ? formValues.channel || ""
                      : formValues.source || ""
                  }
                  onChange={handleChange(isVideo ? "channel" : "source")}
                  required
                />
              </label>

              {isVideo && (
                <label className="mp-admin-label">
                  Channel Tag
                  <input
                    type="text"
                    value={formValues.channelTag || ""}
                    onChange={handleChange("channelTag")}
                    placeholder="DD NEWS"
                  />
                </label>
              )}

              {/* Date, Duration, Thumbnail URL, Image URL removed from UI as per your request */}

              <label className="mp-admin-label">
                {isVideo ? "YouTube / Shorts URL" : "Article Link"}
                <input
                  type="text"
                  value={formValues.link || ""}
                  onChange={handleChange("link")}
                  placeholder={
                    isVideo ? "https://youtube.com/..." : "https://..."
                  }
                />
              </label>

              <label className="mp-admin-label">
                {isVideo ? "Description" : "Summary"}
                <textarea
                  value={formValues.summary || ""}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      summary: e.target.value,
                      desc: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </label>
            </>
          )}

          <label className="mp-admin-label mp-admin-label-row">
            <span>Active</span>
            <input
              type="checkbox"
              checked={formValues.active ?? true}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  active: e.target.checked,
                }))
              }
              className="mp-admin-checkbox"
            />
          </label>

          <div className="mp-admin-form-actions">
            <button
              type="button"
              className="mp-admin-form-btn secondary"
              onClick={onCancel}
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              className="mp-admin-form-btn primary"
            >
              {text.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}