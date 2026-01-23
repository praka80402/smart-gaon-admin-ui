import { useEffect, useState,useCallback } from "react";
import {
  getEntriesByCategory,
  getAllCompetitions,
  declareWinner,
  getTalentEntriesWithReports,
  getTalentEntryReports 
} from "../../services/gaonTalentService";
import ReportModal from "../ReportModal";

  const CATEGORIES = [
    "ART",
    "DANCING",
    "PUBLIC_SPEAKING",
    "SINGING",
    "ENTERTAINMENT"
  ];

export default function Engagement() {
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const [searchInput, setSearchInput] = useState("");   // user types
  const [searchValue, setSearchValue] = useState("");   // actual search

  const [likeFilter, setLikeFilter] = useState("NONE"); // ⭐ NEW FILTER
  
  const [reports, setReports] = useState([]);
const [showReports, setShowReports] = useState(false);


  const pageSize = 5;

  
const loadEngagementData = useCallback(async () => {
  const compRes = await getAllCompetitions();
  setCompetitions(compRes.data);
const res = await getTalentEntriesWithReports({
    page: 0,
    size: 5
  });

  setUsers(res.data?.content || []);
}, []);

const handleViewReports = async (entryId) => {
  try {
    const res = await getTalentEntryReports(entryId);
    setReports(res.data || []);
    setShowReports(true);
  } catch {
    setReports([]);
    setShowReports(true);
  }
};

//   let allUsers = [];
//   for (let cat of CATEGORIES) {
//     // const res = await getEntriesByCategory(cat);
//     const res = await getTalentEntriesWithReports();
//     allUsers = [...allUsers, ...res.data];
//   }
//   setUsers(allUsers);
// }, []);

useEffect(() => {
  loadEngagementData();
}, [loadEngagementData]);

  const getCompetitionName = (id) => {
    if (!id) return "Not Participated";
    const comp = competitions.find((c) => c.id === id);
    return comp ? comp.name : "Not Participated";
  };

  const getCategory = (cat) => (cat ? cat : "Not Participated");

  const isImage = (url) =>
    url?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

  const isVideo = (url) =>
    url?.toLowerCase().match(/\.(mp4|mov|mkv|avi|webm)$/);

  const markAsWinner = async (id) => {
    await declareWinner(id);
    loadEngagementData();
  };

  /* ⭐ SEARCH FILTER */
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

  /* ⭐ LIKE / COMMENT SORTING */
  let sortedUsers = [...filteredUsers];

  if (likeFilter === "MOST_LIKED") {
    sortedUsers.sort((a, b) => b.likes - a.likes);
  } else if (likeFilter === "LEAST_LIKED") {
    sortedUsers.sort((a, b) => a.likes - b.likes);
  } else if (likeFilter === "MOST_COMMENTED") {
    sortedUsers.sort((a, b) => b.comments - a.comments);
  }

  /* PAGINATION */
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentRows = sortedUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  /* Press Enter triggers search */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") performSearch();
  };

  const performSearch = () => {
    setSearchValue(searchInput);
    setCurrentPage(1);
  };

  return (
    <>
      <h2 style={{ marginBottom: "20px" }}>Engagement Overview</h2>

      {/* ⭐ SEARCH BAR + BUTTON + FILTER */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search by Name, Phone, Category, Reference No..."
          value={searchInput}
          onKeyDown={handleKeyPress}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "480px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={performSearch}
          style={{
            padding: "8px 16px",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Search
        </button>

        <select
          value={likeFilter}
          onChange={(e) => {
            setLikeFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "160px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#f8f8f8"
          }}
        >
          <option value="NONE">Filter: None</option>
          <option value="MOST_LIKED">Most Liked</option>
          <option value="LEAST_LIKED">Least Liked</option>
          <option value="MOST_COMMENTED">Most Commented</option>
        </select>
      </div>

      {/* TABLE */}
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
              <th>Reports</th>
              <th>View</th>
              <th>Winner</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((u) => (
              <tr key={u.id} className={u.winner ? "winner-row" : ""}>
                <td>
                  {u.name} {u.winner && <span style={{ color: "green" }}>🏆</span>}
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
  <b>{u.reportCount ?? 0}</b>
  {u.reportCount > 0 && (
    <button
      className="gc-btn-view"
      style={{ marginLeft: "6px" }}
      onClick={() => handleViewReports(u.id)}
    >
      View
    </button>
  )}
</td>


                <td>
                  <button className="view-btn" onClick={() => setSelectedPost(u)}>
                    View
                  </button>
                </td>

                <td>
                  {!u.winner ? (
                    <button className="save-btn" onClick={() => markAsWinner(u.id)}>
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

      {/* MEDIA MODAL */}
      {selectedPost && (
        <div className="modal-overlay">
          <div className="media-modal">
            <button className="modal-close" onClick={() => setSelectedPost(null)}>
              ✕
            </button>

            <div className="media-wrapper">
              {isImage(selectedPost.mediaUrl) ? (
                <img
                  src={selectedPost.mediaUrl}
                  alt={selectedPost.name ? `${selectedPost.name} image` : "Media"}
                  className="media-content"
                />
              ) : isVideo(selectedPost.mediaUrl) ? (
                <video controls className="media-content">
                  <source src={selectedPost.mediaUrl} />
                </video>
              ) : (
                <p>No Media</p>
              )}
            </div>

            <div className="modal-stats">
              <p>
                <b>Likes:</b> {selectedPost.likes}
              </p>
              <p>
                <b>Comments:</b> {selectedPost.comments}
              </p>

         

            </div>
          </div>
        </div>
      )}
      {/* REPORT MODAL (TOP LEVEL) */}
{showReports && (
  <ReportModal
    reports={reports}
    onClose={() => setShowReports(false)}
  />
)}
    </>
  );
}
