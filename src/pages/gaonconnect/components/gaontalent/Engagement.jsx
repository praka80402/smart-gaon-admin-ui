import React, { useEffect, useState } from "react";
import {
  getEntriesByCategory,
  getAllCompetitions,
  declareWinner
} from "../../services/gaonTalentService";

export default function Engagement() {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchInput, setSearchInput] = useState("");     // user types here
  const [searchValue, setSearchValue] = useState("");     // actual search action

  const pageSize = 10;

  const categories = [
    "ART",
    "DANCING",
    "PUBLIC_SPEAKING",
    "SINGING",
    "ENTERTAINMENT"
  ];

  useEffect(() => {
    loadEngagementData();
  }, []);

  const loadEngagementData = async () => {
    const compRes = await getAllCompetitions();
    setCompetitions(compRes.data);

    let allUsers = [];
    for (let cat of categories) {
      const res = await getEntriesByCategory(cat);
      allUsers = [...allUsers, ...res.data];
    }
    setUsers(allUsers);
  };

  const getCompetitionName = (id) => {
    if (!id) return "Not Participated";
    const comp = competitions.find((c) => c.id === id);
    return comp ? comp.name : "Not Participated";
  };

  const getCategory = (cat) => {
    return cat ? cat : "Not Participated";
  };

  const isImage = (url) =>
    url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

  const isVideo = (url) =>
    url?.toLowerCase().match(/\.(mp4|mov|mkv|avi|webm)$/);

  const markAsWinner = async (id) => {
    await declareWinner(id);
    loadEngagementData();
  };

  /* SEARCH FILTER (activated only when searchValue updates) */
  const filteredUsers = users.filter((u) => {
    const text = searchValue.toLowerCase();
    return (
      u.name?.toLowerCase().includes(text) ||
      u.phone?.includes(text) ||
      u.villageOrArea?.toLowerCase().includes(text) ||
      getCategory(u.category).toLowerCase().includes(text) ||
      getCompetitionName(u.competitionId).toLowerCase().includes(text) ||
      (u.referenceNumber || "").toLowerCase().includes(text)
    );
  });

  /* PAGINATION */
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentRows = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  /* When pressing Enter key inside input */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") performSearch();
  };

  /* Perform search */
  const performSearch = () => {
    setSearchValue(searchInput);
    setCurrentPage(1);
  };

  return (
    <>
      <h2 style={{ marginBottom: "20px" }}>Engagement Overview</h2>

      {/* ⭐ SEARCH BAR + BUTTON */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by Name, Phone, Category, Reference No..."
          value={searchInput}
          onKeyDown={handleKeyPress}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "250px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={performSearch}
          style={{
            padding: "8px 16px",
            background: "#4d79ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      <div className="table-container">
        <table className="eng-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Village/Area</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Competition</th>
              <th>Reference No.</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>View</th>
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((u) => (
              <tr key={u.id} className={u.winner ? "winner-row" : ""}>
                <td>
                  {u.name}{" "}
                  {u.winner && <span style={{ color: "green" }}>🏆</span>}
                </td>
                <td>{u.dob}</td>
                <td>{u.villageOrArea}</td>
                <td>{u.phone}</td>
                <td>{getCategory(u.category)}</td>
                <td>{getCompetitionName(u.competitionId)}</td>
                <td>{u.referenceNumber || "N/A"}</td>
                <td>{u.likes}</td>
                <td>{u.comments}</td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedPost(u)}
                  >
                    View
                  </button>
                </td>

                <td>
                  {!u.winner ? (
                    <button
                      className="save-btn"
                      onClick={() => markAsWinner(u.id)}
                    >
                      Declare
                    </button>
                  ) : (
                    <button className="winner-btn">Winner ✓</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selectedPost && (
        <div className="modal-overlay">
          <div className="media-modal">

            <button
              className="modal-close"
              onClick={() => setSelectedPost(null)}
            >
              ✕
            </button>

            <div className="media-wrapper">
              {isImage(selectedPost.mediaUrl) ? (
                <img src={selectedPost.mediaUrl} className="media-content" />
              ) : isVideo(selectedPost.mediaUrl) ? (
                <video controls className="media-content">
                  <source src={selectedPost.mediaUrl} />
                </video>
              ) : (
                <p>No Media</p>
              )}
            </div>

            <div className="modal-stats">
              <p><b>Likes:</b> {selectedPost.likes}</p>
              <p><b>Comments:</b> {selectedPost.comments}</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
