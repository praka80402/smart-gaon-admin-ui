// src/pages/communityNews/PostedItem.jsx
import React, { useState } from "react";
import "./communityNews.css";

const truncate = (t, n = 150) =>
  t?.length > n ? t.slice(0, n) + "..." : t;

export default function PostedItem({ item, type, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);

  const images = item.imageUrls || [];
  const video = item.videoUrl;

  return (
    <div className="cn-card">
      <div className="cn-menu">
        <span onClick={() => setMenu(!menu)}>⋮</span>

        {menu && (
          <div className="cn-menu-dropdown">
            <div onClick={() => { setMenu(false); onEdit(item); }}>✏️ Edit</div>
            <div className="delete" onClick={() => { setMenu(false); onDelete(item); }}>🗑 Delete</div>
          </div>
        )}
      </div>

      {images.length > 0 && <img src={images[0]} className="cn-img" />}

      <h4>{item.title}</h4>
      <p>{truncate(item.summary || item.description)}</p>

      {video && <video controls className="cn-video" src={video} />}
    </div>
  );
}
