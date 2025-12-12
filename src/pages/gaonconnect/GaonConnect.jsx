// src/pages/gaonconnect/GaonConnect.jsx
import React, { useState, useEffect } from "react";
import "./gaonconnect.css";
import PostedItem from "./PostedItem";
import EditModal from "./EditModal";

import {
  getAllNews, updateNews, deleteNews,
  getAllEvents, updateEvent, deleteEvent,
  createNewsWithImage, createEventWithMedia,
  updateEventWithMedia, updateNewsWithMedia
} from "./gaonConnectService";

function formatDateISO() {
  return new Date().toISOString().slice(0, 19);
}

const GaonConnect = () => {
  const [activePage, setActivePage] = useState("Community Wall"); // 🔥 MAIN PAGE SWITCHER

  const [section, setSection] = useState("News");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  // -------------------------------------------
  // LOAD COMMUNITY WALL DATA (News & Events)
  // -------------------------------------------
  const load = async () => {
    if (activePage !== "Community Wall") return; // Only load when CW is active

    setLoading(true);
    try {
      const res = section === "News"
        ? await getAllNews(0, 50)
        : await getAllEvents(0, 50);

      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [section, activePage]);

  // File preview
  const previewImages = images.map((f) => URL.createObjectURL(f));
  const previewVideo = video ? URL.createObjectURL(video) : null;

  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert("Max 5 images allowed");
      return;
    }
    setImages(files);
  };

  const onVideoChange = (e) => {
    setVideo(e.target.files?.[0] || null);
  };

  // -------------------------------------------
  // CREATE POST
  // -------------------------------------------
  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Enter title and body");
      return;
    }

    setLoading(true);

    try {
      if (section === "News") {
        const newsPayload = {
          category: "General",
          title,
          summary: body.substring(0, 150),
          content: body,
          author: "Admin",
        };

        await createNewsWithImage(newsPayload, images, video);
      } else {
        if (images.length === 0) {
          alert("Event requires at least one image");
          setLoading(false);
          return;
        }

        const eventPayload = {
          title,
          description: body,
          startDateTime: formatDateISO(),
          endDateTime: formatDateISO(),
          location: "Village",
          contactInfo: "Admin",
        };

        await createEventWithMedia(eventPayload, images, video);
      }

      setTitle("");
      setBody("");
      setImages([]);
      setVideo(null);

      await load();
      alert("Posted!");
    } catch (e) {
      console.error(e);
      alert("Post failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // DELETE POST
  // -------------------------------------------
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      section === "News"
        ? await deleteNews(item.id)
        : await deleteEvent(item.id);

      await load();
      alert("Deleted");
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditVisible(false);
  };

  const saveEdit = async (
    payload,
    { newImages = [], newVideo = null, removedImageUrls = [], removeExistingVideo = false } = {}
  ) => {
    try {
      const mediaChanged =
        newImages.length > 0 ||
        newVideo !== null ||
        removedImageUrls.length > 0 ||
        removeExistingVideo;

      if (section === "News") {
        mediaChanged
          ? await updateNewsWithMedia(payload.id, payload, newImages, newVideo, removedImageUrls)
          : await updateNews(payload.id, payload);
      } else {
        mediaChanged
          ? await updateEventWithMedia(payload.id, payload, newImages, newVideo, removedImageUrls)
          : await updateEvent(payload.id, payload);
      }

      closeEdit();
      await load();
      alert("Updated!");
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  // -------------------------------------------
  // HEADER TEXTS (Dynamic)
  // -------------------------------------------
  const headerSubtitle = {
    "Community Wall": "Manage news & events in your village community.",
    Forum: "Discuss topics, ask questions, and get help from villagers.",
    "Raise Issue": "Report problems and track resolutions.",
    "Job Board": "Browse and post job opportunities.",
    "Village Directory": "Find important village contacts.",
    Suggestions: "Share your ideas to improve the community.",
  };

  return (
    <div className="gc-container">

      {/* MAIN HEADER */}
      <div className="gc-header">
        <h1>Gaon Connect – {activePage}</h1>
        <p>{headerSubtitle[activePage]}</p>
      </div>

      {/* SUB HEADER MENU */}
      <div className="gc-subheader">
        {[
          "Community Wall",
          "Forum",
          "Raise Issue",
          "Job Board",
          "Village Directory",
          "Suggestions",
        ].map((tab) => (
          <div
            key={tab}
            className={`gc-sub-item ${activePage === tab ? "active" : ""}`}
            onClick={() => setActivePage(tab)}
          >
            {tab === "Community Wall" && "📄 Community Wall"}
            {tab === "Forum" && "💬 Forum"}
            {tab === "Raise Issue" && "⚠️ Raise Issue"}
            {tab === "Job Board" && "💼 Job Board"}
            {tab === "Village Directory" && "📞 Village Directory"}
            {tab === "Suggestions" && "💡 Suggestions"}
          </div>
        ))}
      </div>

      {/* -------------------------------------------
         COMMUNITY WALL SECTION
      ------------------------------------------- */}
      {activePage === "Community Wall" && (
        <>
          <div className="gc-form-section">
            <h2>Community Wall – News & Events</h2>

            <label>Headline</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="News">📰 News</option>
              <option value="Event">📅 Event</option>
            </select>

            <label>Body Text</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} />

            <label>{section === "News" ? "Images (0-5)" : "Images (1-5)"}</label>
            <input type="file" accept="image/*" multiple onChange={onImagesChange} />

            <div className="gc-preview-row">
              {previewImages.map((src, i) => (
                <img key={i} src={src} className="gc-thumb-small" alt="" />
              ))}
            </div>

            <label>Video (optional)</label>
            <input type="file" accept="video/*" onChange={onVideoChange} />

            {previewVideo && (
              <video controls src={previewVideo} className="gc-video-preview" />
            )}

            <button className="gc-submit" onClick={handlePost} disabled={loading}>
              {loading ? "Posting..." : "Post to Wall"}
            </button>
          </div>

          {/* POSTS LIST */}
          <div className="gc-posted-section">
            <h3>Posted Items</h3>

            {loading ? (
              <p>Loading...</p>
            ) : items.length === 0 ? (
              <p>No items</p>
            ) : (
              <div className="gc-cart-grid">
                {items.map((it) => (
                  <PostedItem
                    key={it.id}
                    item={it}
                    type={section}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* -------------------------------------------
         FORUM PAGE (Placeholder)
      ------------------------------------------- */}
      {activePage === "Forum" && (
        <div className="gc-form-section">
          <h2>Forum Coming Soon</h2>
          <p>This is where villagers can create discussions & reply.</p>
        </div>
      )}

      {/* MODAL */}
      <EditModal
        visible={editVisible}
        onClose={closeEdit}
        initial={editing}
        type={section}
        onSave={saveEdit}
      />
    </div>
  );
};

export default GaonConnect;
