// src/pages/gaonconnect/GaonConnect.jsx
import React, { useState, useEffect } from "react";
import "./gaonconnect.css";
import PostedItem from "./PostedItem";
import EditModal from "./EditModal";
import ForumFilter from "./ForumFilter";

// ⭐ NEW IMPORT (DO NOT REMOVE)
import VillageDirectory from "./VillageDirectory";

import {
  getAllNews,
  getAllEvents,
  createNewsWithImage,
  createEventWithMedia,
  deleteNews,
  deleteEvent,
  updateNews,
  updateEvent,
  updateNewsWithMedia,
  updateEventWithMedia,
  getAllForumPosts,
  deleteForumPost,
} from "./gaonConnectService";

function formatDateISO() {
  return new Date().toISOString().slice(0, 19);
}

const GaonConnect = () => {
  const [activePage, setActivePage] = useState("Community Wall");

  const [section, setSection] = useState("News");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- Forum State ----------------
  const [forumItems, setForumItems] = useState([]);
  const [forumLoading, setForumLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination + Sorting
  const [forumPage, setForumPage] = useState(0);
  const [forumSize] = useState(10);
  const [forumSort, setForumSort] = useState("createdAt,desc");
  const [forumTotalPages, setForumTotalPages] = useState(1);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  // ---------------- Load Community Wall ----------------
  const load = async () => {
    if (activePage !== "Community Wall") return;

    setLoading(true);

    try {
      const res =
        section === "News"
          ? await getAllNews(0, 50)
          : await getAllEvents(0, 50);

      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [section, activePage]);

  // ---------------- Load Forum ----------------
  const loadForum = async () => {
    if (activePage !== "Forum") return;

    setForumLoading(true);

    try {
      const params = {
        page: forumPage,
        size: forumSize,
        sort: forumSort,
      };

      if (searchPhone.trim()) params.phone = searchPhone.trim();
      if (fromDate && toDate) {
        params.fromDate = new Date(fromDate).toISOString();
        params.toDate = new Date(toDate).toISOString();
      }

      const res = await getAllForumPosts(params);
      setForumItems(res.data?.content || []);
      setForumTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setForumItems([]);
    } finally {
      setForumLoading(false);
    }
  };

  useEffect(() => {
    loadForum();
  }, [activePage]);

  useEffect(() => {
    if (activePage === "Forum") loadForum();
  }, [forumPage, forumSort]);

  // ---------------- File Upload ----------------
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

  // ---------------- Create ----------------
  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Enter title and body");
      return;
    }

    setLoading(true);

    try {
      if (section === "News") {
        const payload = {
          category: "General",
          title,
          summary: body.substring(0, 150),
          content: body,
          author: "Admin",
        };

        await createNewsWithImage(payload, images, video);
      } else {
        if (images.length === 0) {
          alert("Event requires at least one image");
          setLoading(false);
          return;
        }

        const payload = {
          title,
          description: body,
          startDateTime: formatDateISO(),
          endDateTime: formatDateISO(),
          location: "Village",
          contactInfo: "Admin",
        };

        await createEventWithMedia(payload, images, video);
      }

      setTitle("");
      setBody("");
      setImages([]);
      setVideo(null);

      await load();
      alert("Posted!");
    } catch (err) {
      console.error(err);
      alert("Post failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Delete CW Item ----------------
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      section === "News"
        ? await deleteNews(item.id)
        : await deleteEvent(item.id);

      await load();
      alert("Deleted!");
    } catch {
      alert("Delete failed");
    }
  };

  // ---------------- Delete Forum Post ----------------
  const handleDeleteForum = async (postId) => {
    if (!window.confirm("Delete this forum post?")) return;

    try {
      await deleteForumPost(postId);
      await loadForum();
      alert("Forum post deleted");
    } catch {
      alert("Delete failed");
    }
  };

  // ---------------- Edit ----------------
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
    { newImages = [], newVideo = null, removedImageUrls = [] } = {}
  ) => {
    try {
      const mediaChanged =
        newImages.length > 0 ||
        newVideo !== null ||
        removedImageUrls.length > 0;

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

      closeEdit();
      await load();
      alert("Updated!");
    } catch {
      alert("Update failed");
    }
  };

  // ---------------- HEADER TEXT ----------------
  const headerSubtitle = {
    "Community Wall": "Manage news & events in your village.",
    Forum: "View and manage community forum posts.",
    "Raise Issue": "",
    "Job Board": "",
    Suggestions: "",
    "Village Directory": "View and manage all users by pincode.",
  };

  return (
    <div className="gc-container">

      {/* HEADER */}
      <div className="gc-header">
        <h1>Gaon Connect – {activePage}</h1>
        <p>{headerSubtitle[activePage]}</p>
      </div>

      {/* SUB MENU */}
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
            {tab}
          </div>
        ))}
      </div>

      {/* COMMUNITY WALL */}
      {activePage === "Community Wall" && (
        <>
          <div className="gc-form-section">
            <h2>Post News / Events</h2>

            <label>Headline</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />

            <label>Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="News">News</option>
              <option value="Event">Event</option>
            </select>

            <label>Body Text</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} />

            <label>{section === "News" ? "Images (0–5)" : "Images (1–5)"}</label>
            <input type="file" multiple accept="image/*" onChange={onImagesChange} />

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

            <button className="gc-submit" onClick={handlePost}>
              Post
            </button>
          </div>

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

      {/* FORUM PAGE */}
      {activePage === "Forum" && (
        <div className="gc-form-section">
          <h2>Forum Posts</h2>

          <ForumFilter
            searchPhone={searchPhone}
            setSearchPhone={setSearchPhone}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            forumSort={forumSort}
            setForumSort={(value) => {
              setForumSort(value);
              setForumPage(0);
            }}
            onSearch={() => {
              setForumPage(0);
              loadForum();
            }}
          />

          {forumLoading ? (
            <p>Loading...</p>
          ) : forumItems.length === 0 ? (
            <p>No forum posts found</p>
          ) : (
            <div className="gc-cart-grid">
              {forumItems.map((it) => (
                <PostedItem
                  key={it.postId}
                  item={it}
                  type="Forum"
                  onDelete={() => handleDeleteForum(it.postId)}
                />
              ))}
            </div>
          )}

          <div className="gc-pagination">
            <button
              disabled={forumPage === 0}
              onClick={() => setForumPage(forumPage - 1)}
            >
              ◀ Previous
            </button>

            <span>
              Page {forumPage + 1} of {forumTotalPages}
            </span>

            <button
              disabled={forumPage + 1 >= forumTotalPages}
              onClick={() => setForumPage(forumPage + 1)}
            >
              Next ▶
            </button>
          </div>
        </div>
      )}

      {/* ⭐ NEW PAGE — VILLAGE DIRECTORY */}
      {activePage === "Village Directory" && (
        <VillageDirectory />
      )}

      {/* EDIT MODAL */}
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
