import React, { useState, useEffect } from "react";
// import {
//   getAllNews,
//   getAllEvents,
//   createNewsWithImage,
//   createEventWithMedia,
//   deleteNews,
//   deleteEvent,
//   updateNews,
//   updateEvent,
//   updateNewsWithMedia,
//   updateEventWithMedia,
// } from "../services/newsService";

import {
  getAllNews,
  createNewsWithImage,
  deleteNews,
  updateNews,
  updateNewsWithMedia,
} from "../services/newsService";

import {
  getAllEvents,
  createEventWithMedia,
  deleteEvent,
  updateEvent,
  updateEventWithMedia,
} from "../services/eventsService";
import PostedItem from "./PostedItem";
import EditModal from "./EditModal";

const formatDateISO = () => new Date().toISOString().slice(0, 19);

const NewsEvents = () => {
  const [section, setSection] = useState("News");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res =
        section === "News"
          ? await getAllNews(0, 50)
          : await getAllEvents(0, 50);

      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [section]);

  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) return alert("Max 5 images allowed");
    setImages(files);
  };

  const onVideoChange = (e) => setVideo(e.target.files?.[0] || null);

  const handlePost = async () => {
    if (!title.trim() || !body.trim())
      return alert("Title & body required");

    setLoading(true);

    try {
      if (section === "News") {
        await createNewsWithImage(
          {
            category: "General",
            title,
            summary: body.slice(0, 150),
            content: body,
            author: "Admin",
          },
          images,
          video
        );
      } else {
        if (images.length === 0)
          return alert("Event requires at least 1 image");

        await createEventWithMedia(
          {
            title,
            description: body,
            startDateTime: formatDateISO(),
            endDateTime: formatDateISO(),
            location: "Village",
            contactInfo: "Admin",
          },
          images,
          video
        );
      }

      setTitle("");
      setBody("");
      setImages([]);
      setVideo(null);

      load();
      alert("Posted!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this item?")) return;

    section === "News"
      ? await deleteNews(item.id)
      : await deleteEvent(item.id);

    load();
  };

  const openEdit = (item) => {
    setEditing(item);
    setEditVisible(true);
  };

  const saveEdit = async (
    payload,
    { newImages = [], newVideo = null, removedImageUrls = [] } = {}
  ) => {
    const mediaChanged =
      newImages.length || newVideo || removedImageUrls.length;

    if (section === "News") {
      mediaChanged
        ? await updateNewsWithMedia(
            payload.id,
            payload,
            newImages,
            newVideo,
            removedImageUrls
          )
        : await updateNews(payload.id, payload);
    } else {
      mediaChanged
        ? await updateEventWithMedia(
            payload.id,
            payload,
            newImages,
            newVideo,
            removedImageUrls
          )
        : await updateEvent(payload.id, payload);
    }

    setEditVisible(false);
    setEditing(null);
    load();
  };

  return (
    <div className="gc-form-section">
      <h2>Post News / Events</h2>

      <label>Headline</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Section</label>
      <select value={section} onChange={(e) => setSection(e.target.value)}>
        <option value="News">News</option>
        <option value="Event">Event</option>
      </select>

      <label>Body</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />

      <label>{section === "News" ? "Images (0–5)" : "Images (1–5)"}</label>
      <input type="file" multiple accept="image/*" onChange={onImagesChange} />

      <label>Video (optional)</label>
      <input type="file" accept="video/*" onChange={onVideoChange} />

      <button className="gc-submit" onClick={handlePost}>
        Post
      </button>

      <h3>Posted Items</h3>
      {loading ? (
        <p>Loading...</p>
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

      <EditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        initial={editing}
        type={section}
        onSave={saveEdit}
      />
    </div>
  );
};

export default NewsEvents;
