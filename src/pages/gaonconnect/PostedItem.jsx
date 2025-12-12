// src/pages/gaonconnect/PostedItem.jsx
import React, { useState } from "react";
import "./gaonconnect.css";

const truncate = (text, n = 220) =>
  !text ? "" : text.length > n ? text.slice(0, n).trim() + "…" : text;

const PostedItem = ({ item = {}, type = "News", onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const title = item.title || "Untitled";
  const body = item.summary || item.description || "";

  const images = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  const video = item.videoUrl || null;

  const firstImage = images.length > 0 ? images[0] : null;
  const moreCount = images.length > 1 ? images.length - 1 : 0;

  return (
    <div className="gc-cart">
      
      {/* 3 DOT MENU TOP RIGHT */}
      <div className="gc-menu-wrapper">
        <div className="gc-menu-dots" onClick={() => setMenuOpen(!menuOpen)}>
          ⋮
        </div>

        {menuOpen && (
          <div className="gc-menu-dropdown">
            {onEdit && (
              <div className="gc-menu-item" onClick={() => { setMenuOpen(false); onEdit(item); }}>
                ✏️ Edit
              </div>
            )}
            {onDelete && (
              <div className="gc-menu-item delete" onClick={() => { setMenuOpen(false); onDelete(item); }}>
                🗑️ Delete
              </div>
            )}
          </div>
        )}
      </div>

      {/* IMAGE */}
      {firstImage && (
        <img src={firstImage} className="gc-cart-image" alt={title} />
      )}

      {/* TITLE */}
      <h4 className="gc-cart-title">{title}</h4>

      {/* BODY */}
      <p className="gc-cart-desc">{truncate(body, 150)}</p>

      {/* VIDEO */}
      {video && <video controls className="gc-cart-video" src={video} />}

      {/* FOOTER */}
      <div className="gc-cart-footer">
        <span className="gc-cart-type">{type}</span>
        <span className="gc-cart-date">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleString()
            : item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : ""}
        </span>
      </div>
    </div>
  );
};

export default PostedItem;
