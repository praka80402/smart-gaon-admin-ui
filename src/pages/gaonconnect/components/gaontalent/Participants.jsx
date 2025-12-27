import React, { useState, useEffect } from "react";
import {
  getEntriesByCategory
} from "../../services/gaonTalentService";

export default function Participants() {
  const [category, setCategory] = useState("ART");
  const [entries, setEntries] = useState([]);

  // 🔹 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // 6 cards per page

  useEffect(() => {
    loadEntries();
  }, [category]);

  const loadEntries = async () => {
    const res = await getEntriesByCategory(category);
    setEntries(res.data);
    setCurrentPage(1);
  };

  // 🔥 Auto detect if file is image (fixes wrong mediaType from backend)
  const isImage = (url) => {
    return url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  };

  // 🔹 Paginated Data
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentEntries = entries.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(entries.length / pageSize);

  return (
    <>
      {/* Category dropdown */}
      <div className="cat-select">
        <select
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          <option>ART</option>
          <option>DANCING</option>
          <option>SINGING</option>
          <option>ENTERTAINMENT</option>
          <option>PUBLIC_SPEAKING</option>
        </select>
      </div>

      {/* Participants Grid */}
      <div className="entry-grid">
        {currentEntries.map((e) => (
          <div
            key={e.id}
            className={`entry-card ${e.winner ? "winner-highlight" : ""}`}
          >
            {/* Profile Image */}
            <img
              src={e.profileImageUrl || "https://via.placeholder.com/100"}
              className="profile-img"
              alt="profile"
            />

            <h4>
              {e.name}{" "}
              {e.winner && <span className="winner-tag">🏆 Winner</span>}
            </h4>

            <p>Village: {e.villageOrArea}</p>
            <p>Phone: {e.phone}</p>

            {/* Media Area */}
            {isImage(e.mediaUrl) ? (
              <img src={e.mediaUrl} className="media-img" alt="media" />
            ) : (
              <video controls className="media-video">
                <source src={e.mediaUrl} />
              </video>
            )}

            {/* Stats */}
            <div className="stats">
              <span>Likes: {e.likes}</span>
              <span>Comments: {e.comments}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
