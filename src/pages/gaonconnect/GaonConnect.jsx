import React, { useState, useEffect } from "react";
import "./gaonconnect.css";
import PostedItem from "./PostedItem";
import EditModal from "./EditModal";

import {
  getAllNews, updateNews, deleteNews,
  getAllEvents, updateEvent, deleteEvent,
  createNewsWithImage, createEventWithImage
} from "./gaonConnectService";

// Format date: YYYY-MM-DDTHH:mm:ss
function formatDate() {
  return new Date().toISOString().slice(0, 19);
}

const GaonConnect = () => {
  const [section, setSection] = useState("News");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  // LOAD LIST
  const load = async () => {
    setLoading(true);
    try {
      if (section === "News") {
        const res = await getAllNews(0, 50);
        setItems(res.data);
      } else {
        const res = await getAllEvents(0, 50);
        setItems(res.data);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [section]);

  // CREATE POST
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

        await createNewsWithImage(newsPayload, file);

      } else {
        if (!file) {
          alert("Please select an event image");
          setLoading(false);
          return;
        }

        const eventPayload = {
          title,
          description: body,
          startDateTime: formatDate(),
          endDateTime: formatDate(),
          location: "Village",
          contactInfo: "Admin",
        };

        await createEventWithImage(eventPayload, file);
      }

      setTitle("");
      setBody("");
      setFile(null);
      await load();
      alert("Posted successfully!");
    } catch (e) {
      console.error(e);
      alert("Post failed");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      if (section === "News") await deleteNews(item.id);
      else await deleteEvent(item.id);

      await load();
      alert("Deleted");
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  // EDIT OPEN
  const openEdit = (item) => {
    setEditing(item);
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditVisible(false);
  };

  // SAVE EDIT
  const saveEdit = async (payload) => {
    try {
      if (section === "News") await updateNews(payload.id, payload);
      else await updateEvent(payload.id, payload);

      closeEdit();
      await load();
      alert("Updated");
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  return (
    <div className="gc-container">
      <div className="gc-header">
        <h1>Gaon Connect – Community Hub</h1>
        <p>Manage news & events for the village community.</p>
      </div>

      <div className="gc-form-section">
        <h2>Post News / Event</h2>

        <label>Headline</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Section</label>
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="News">📰 News</option>
          <option value="Event">📅 Event</option>
        </select>

        <label>Description</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />

        <label>Image</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={handlePost} disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="gc-posted-section">
        <h3>Posted Items</h3>
        {loading ? <p>Loading...</p> : items.length === 0 ? <p>No items</p> :
          items.map((it) => (
            <PostedItem
              key={it.id}
              item={it}
              type={section}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <EditModal visible={editVisible} onClose={closeEdit} initial={editing} type={section} onSave={saveEdit} />
    </div>
  );
};

export default GaonConnect;
