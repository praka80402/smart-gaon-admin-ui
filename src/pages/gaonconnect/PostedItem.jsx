import React from "react";
import "./gaonconnect.css";

const PostedItem = ({ item, type, onEdit, onDelete }) => {
  const title = item.title;
  const body = item.summary || item.description;
  const img = item.thumbnailUrl || item.pictureUrl;

  return (
    <div className="gc-post-card">
      <div className="gc-post-top">
        <h4 className="gc-post-title">{title}</h4>
        <div className="gc-post-actions">
          <button className="gc-edit" onClick={() => onEdit(item)}>Edit</button>
          <button className="gc-delete" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </div>

      <p className="gc-post-body">{body}</p>
      {img && <img className="gc-thumb" src={img} alt="thumb" />}

      <div className="gc-post-meta">
        <span>{type}</span>
        <span>
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
