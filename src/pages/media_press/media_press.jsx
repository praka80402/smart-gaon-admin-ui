import React, { useState } from "react";
import "./mediapress-admin.css";

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
  cancel: "Cancel",
  save: "Save",
  confirmDelete: "Are you sure you want to delete this item?",
};

const TABS = [
  { key: "featured", label: text.featured },
  { key: "press", label: text.press },
  { key: "videos", label: text.videos },
  { key: "logos", label: text.logos },
];

const INITIAL_FEATURED = {
  id: "f1",
  title: "SmartGaon initiative expands digital village services",
  source: "SmartGaon Media Desk",
  type: "newspaper",
  summary: "Featured coverage can be edited here before connecting this page to live media APIs.",
  image: "",
  date: "June 1, 2026",
  link: "",
};

export default function MediaPressAdminPage() {
  const [activeTab, setActiveTab] = useState("featured");
  const [featured, setFeatured] = useState(INITIAL_FEATURED);
  const [pressArticles, setPressArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [logos, setLogos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const openAddForm = (type) => {
    setEditingType(type);
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (type, item) => {
    setEditingType(type);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingType(null);
    setEditingItem(null);
  };

  const handleDelete = (type, idOrName) => {
    if (!window.confirm(text.confirmDelete)) return;

    if (type === "featured") {
      setFeatured(null);
    } else if (type === "press") {
      setPressArticles((prev) => prev.filter((item) => item.id !== idOrName));
    } else if (type === "videos") {
      setVideos((prev) => prev.filter((item) => item.id !== idOrName));
    } else if (type === "logos") {
      setLogos((prev) => prev.filter((item) => item.name !== idOrName));
    }
  };

  const handleFormSubmit = (type, values) => {
    if (type === "featured") {
      setFeatured({ ...values, id: "f1", type: values.type || "newspaper" });
    } else if (type === "press") {
      if (editingItem) {
        setPressArticles((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...editingItem, ...values } : item))
        );
      } else {
        setPressArticles((prev) => [
          ...prev,
          { id: `p${Date.now()}`, type: values.type || "newspaper", ...values },
        ]);
      }
    } else if (type === "videos") {
      if (editingItem) {
        setVideos((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...editingItem, ...values } : item))
        );
      } else {
        setVideos((prev) => [
          ...prev,
          { id: `v${Date.now()}`, channelTag: values.channelTag || "NEWS", ...values },
        ]);
      }
    } else if (type === "logos") {
      if (editingItem) {
        setLogos((prev) =>
          prev.map((item) => (item.name === editingItem.name ? { ...editingItem, ...values } : item))
        );
      } else {
        setLogos((prev) => [...prev, { name: values.name, icon: values.icon || "News" }]);
      }
    }

    closeForm();
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
              className={`mp-admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "featured" && (
          <section className="mp-admin-section">
            <div className="mp-admin-section-header">
              <h2>{text.featuredArticle}</h2>
              <button type="button" className="mp-admin-add-btn" onClick={() => openAddForm("featured")}>
                {featured ? text.edit : text.add}
              </button>
            </div>

            {featured ? (
              <div className="mp-admin-card">
                <div className="mp-admin-card-main">
                  <strong>{featured.title}</strong>
                  <p className="mp-admin-small">
                    {featured.source} - {featured.date}
                  </p>
                  <p className="mp-admin-small">{featured.summary}</p>
                  <p className="mp-admin-small">{featured.link}</p>
                </div>
                <div className="mp-admin-card-actions">
                  <button type="button" className="mp-admin-action-btn" onClick={() => openEditForm("featured", featured)}>
                    {text.edit}
                  </button>
                  <button type="button" className="mp-admin-action-btn danger" onClick={() => handleDelete("featured", "f1")}>
                    {text.delete}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mp-admin-empty">No featured article added yet.</p>
            )}
          </section>
        )}

        {activeTab === "press" && (
          <AdminTable
            title={text.press}
            columns={["Title", "Source", "Date", "Type", "Actions"]}
            emptyText="No press articles added yet."
            items={pressArticles}
            onAdd={() => openAddForm("press")}
            renderRow={(item) => (
              <div key={item.id} className="mp-admin-table-row">
                <div>{item.title}</div>
                <div>{item.source}</div>
                <div>{item.date}</div>
                <div>{item.type}</div>
                <ActionButtons
                  onEdit={() => openEditForm("press", item)}
                  onDelete={() => handleDelete("press", item.id)}
                />
              </div>
            )}
          />
        )}

        {activeTab === "videos" && (
          <AdminTable
            title={text.videoCoverage}
            columns={["Title", "Channel", "Date", "Duration", "Actions"]}
            emptyText="No video coverage added yet."
            items={videos}
            onAdd={() => openAddForm("videos")}
            renderRow={(item) => (
              <div key={item.id} className="mp-admin-table-row">
                <div>{item.title}</div>
                <div>{item.channel}</div>
                <div>{item.date}</div>
                <div>{item.duration}</div>
                <ActionButtons
                  onEdit={() => openEditForm("videos", item)}
                  onDelete={() => handleDelete("videos", item.id)}
                />
              </div>
            )}
          />
        )}

        {activeTab === "logos" && (
          <AdminTable
            title={text.mediaLogos}
            columns={["Logo", "Name", "Actions"]}
            emptyText="No media logos added yet."
            items={logos}
            onAdd={() => openAddForm("logos")}
            tableClassName="mp-admin-table logos"
            renderRow={(item) => (
              <div key={item.name} className="mp-admin-table-row">
                <div>{item.icon}</div>
                <div>{item.name}</div>
                <ActionButtons
                  onEdit={() => openEditForm("logos", item)}
                  onDelete={() => handleDelete("logos", item.name)}
                />
              </div>
            )}
          />
        )}
      </div>

      {isFormOpen && (
        <MediaPressAdminForm
          type={editingType}
          initialData={editingItem}
          onCancel={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

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
          {columns.map((column) => (
            <div key={column}>{column}</div>
          ))}
        </div>
        {items.map(renderRow)}
        {items.length === 0 && <div className="mp-admin-empty-row">{emptyText}</div>}
      </div>
    </section>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div>
      <button type="button" className="mp-admin-action-btn" onClick={onEdit}>
        {text.edit}
      </button>
      <button type="button" className="mp-admin-action-btn danger" onClick={onDelete}>
        {text.delete}
      </button>
    </div>
  );
}

function MediaPressAdminForm({ type, initialData, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(() => {
    if (initialData) return { ...initialData };

    return {
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
    };
  });

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(type, formValues);
  };

  const isFeatured = type === "featured";
  const isPress = type === "press";
  const isVideos = type === "videos";
  const isLogos = type === "logos";

  return (
    <div className="mp-admin-form-backdrop" onClick={onCancel}>
      <div className="mp-admin-form-box" onClick={(event) => event.stopPropagation()}>
        <div className="mp-admin-form-header">
          <h3>{initialData ? "Edit Item" : "Add Item"}</h3>
          <button type="button" className="mp-admin-form-close" onClick={onCancel}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mp-admin-form">
          {(isFeatured || isPress || isVideos) && (
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
                {isVideos ? "Channel" : "Source"}
                <input
                  type="text"
                  value={isVideos ? formValues.channel || "" : formValues.source || ""}
                  onChange={handleChange(isVideos ? "channel" : "source")}
                  required
                />
              </label>

              <label className="mp-admin-label">
                Date
                <input type="text" value={formValues.date || ""} onChange={handleChange("date")} placeholder="June 1, 2026" />
              </label>

              {isVideos && (
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
                Image URL
                <input
                  type="text"
                  value={formValues.image || formValues.thumb || ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      image: event.target.value,
                      thumb: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="mp-admin-label">
                {isVideos ? "Description" : "Summary"}
                <textarea
                  value={formValues.summary || formValues.desc || ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      summary: event.target.value,
                      desc: event.target.value,
                    }))
                  }
                  rows={4}
                />
              </label>

              <label className="mp-admin-label">
                Link
                <input type="text" value={formValues.link || ""} onChange={handleChange("link")} placeholder="https://..." />
              </label>
            </>
          )}

          {isLogos && (
            <>
              <label className="mp-admin-label">
                Logo Name
                <input type="text" value={formValues.name || ""} onChange={handleChange("name")} required />
              </label>
              <label className="mp-admin-label">
                Logo Icon
                <input type="text" value={formValues.icon || ""} onChange={handleChange("icon")} placeholder="News" />
              </label>
            </>
          )}

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
