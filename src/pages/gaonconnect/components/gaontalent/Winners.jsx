import React, { useEffect, useState } from "react";
import {
  getEntriesByCategory,
  getAllCompetitions,
  declareWinner,
} from "../../services/gaonTalentService";

export default function Winners() {
  const [participants, setParticipants] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const pageSize = 6;

  const categories = [
    "ART",
    "DANCING",
    "PUBLIC_SPEAKING",
    "SINGING",
    "ENTERTAINMENT",
  ];

  useEffect(() => {
    loadWinnerPageData();
  }, []);

  const loadWinnerPageData = async () => {
    const compRes = await getAllCompetitions();
    setCompetitions(compRes.data);

    let allUsers = [];
    for (let cat of categories) {
      const res = await getEntriesByCategory(cat);
      allUsers = [...allUsers, ...res.data];
    }

    setParticipants(allUsers);
  };

  const getCompetitionName = (id) => {
    const comp = competitions.find((c) => c.id === id);
    return comp ? comp.name : "Not participated";
  };

  const isImage = (url) =>
    url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

  const isVideo = (url) =>
    url?.toLowerCase().match(/\.(mp4|mov|mkv|avi|webm)$/);

  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentRows = participants.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(participants.length / pageSize);

  const markAsWinner = async (id) => {
    await declareWinner(id);
    loadWinnerPageData();
  };

  return (
    <>
      <h2 style={{ marginBottom: "20px" }}>Manage Winners 🏆</h2>

      {/* TABLE VIEW */}
      <table className="winner-table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Village</th>
            <th>Category</th>
            <th>Competition</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Post</th>
            <th>Winner</th>
          </tr>
        </thead>

        <tbody>
          {currentRows.map((u) => (
            <tr key={u.id} className={u.winner ? "winner-row" : ""}>
              <td>
                <img
                  src={u.profileImageUrl || "https://via.placeholder.com/60"}
                  className="profile-small"
                />
              </td>
              <td>
                {u.name}{" "}
                {u.winner && (
                  <span style={{ color: "green", fontWeight: 700 }}>🏆</span>
                )}
              </td>
              <td>{u.villageOrArea}</td>
              <td>{u.category}</td>
              <td>{getCompetitionName(u.competitionId)}</td>
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
                  <button className="winner-btn" disabled>
                    Selected ✓
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

      {/* MODAL VIEW */}
      {selectedPost && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              ×
            </button>

            <h3>{selectedPost.name}'s Post</h3>

            {isImage(selectedPost.mediaUrl) ? (
              <img src={selectedPost.mediaUrl} className="modal-media" />
            ) : isVideo(selectedPost.mediaUrl) ? (
              <video controls className="modal-media">
                <source src={selectedPost.mediaUrl} />
              </video>
            ) : (
              <p>No media</p>
            )}

            <div className="modal-stats">
              <p><b>Likes:</b> {selectedPost.likes}</p>
              <p><b>Comments:</b> {selectedPost.comments}</p>
            </div>

            <button className="close-btn" onClick={() => setSelectedPost(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
