import { useEffect, useState, useCallback } from "react";
import {
  getAllCompetitions,
  declareWinner,
  getTalentEntriesWithReports,
  getTalentEntryReports,
} from "../../services/gaonTalentService";
import ReportModal from "../ReportModal";
import "./Engagement.css";


export default function Engagement() {
  
  /* ================= ROLE CONTROL ================= */

  const role = localStorage.getItem("adminRole");

  const canDeclareWinner =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  /* ================= STATE ================= */

  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [stats, setStats] = useState({
  totalPosts: 0,
  totalCompetitions: 0,
  reportedPosts: 0,
  totalWinners: 0,
});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [likeFilter, setLikeFilter] = useState("NONE");

  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);

  const [rejectRemark, setRejectRemark] = useState("");

  const [moderationLoading, setModerationLoading] =
  useState(false);

  const pageSize = 20;

  /* ================= LOAD DATA ================= */

  const loadEngagementData = useCallback(async () => {
    try {
      const compRes = await getAllCompetitions();

      setCompetitions(compRes.data || []);

      const res = await getTalentEntriesWithReports({
  page: 0,
  size: 50,
});

const responseData = res.data || {};

setUsers(responseData.content || []);

setStats({
  totalPosts: responseData.totalElements || 0,
  totalCompetitions:
    responseData.totalCompetitionsCount || 0,
  reportedPosts:
    responseData.reportedPostsCount || 0,
  totalWinners:
    responseData.totalWinnerCount || 0,
});
      setUsers(res.data?.content || []);
    } catch (error) {
      console.log("Error loading engagement data:", error);
    }
  }, []);

  useEffect(() => {
    loadEngagementData();
  }, [loadEngagementData]);

  /* ================= HELPERS ================= */

  const getCompetitionName = (id) => {
    if (!id) return "Not Participated";

    const comp = competitions.find((c) => c.id === id);

    return comp ? comp.name : "Not Participated";
  };

  const isImage = (url) => {
    return url
      ?.toLowerCase()
      .match(/\.(jpg|jpeg|png|gif|webp)$/);
  };

  const isVideo = (url) => {
    return url
      ?.toLowerCase()
      .match(/\.(mp4|mov|mkv|avi|webm)$/);
  };

  const isYouTube = (url) => {
    return (
      url?.includes("youtube.com") ||
      url?.includes("youtu.be") ||
      url?.includes("youtube.com/shorts/")
    );
  };

  const isYouTubeShort = (url) => {
    return url?.includes("/shorts/");
  };

  const isWinnerDeclarationDisabled = (status) => {
    const normalized = (status || "PENDING").toUpperCase();
    return normalized === "PENDING" || normalized === "REJECTED";
  };

  /* ================= FIXED YOUTUBE SHORTS SUPPORT ================= */

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    try {
      /* SHORTS URL */
      if (url.includes("/shorts/")) {
        const videoId = url.split("/shorts/")[1]?.split("?")[0];

        return `https://www.youtube.com/embed/${videoId}`;
      }

      /* youtu.be URL */
      if (url.includes("youtu.be")) {
        const videoId = url.split("/").pop()?.split("?")[0];

        return `https://www.youtube.com/embed/${videoId}`;
      }

      /* NORMAL YOUTUBE URL */
      const urlObj = new URL(url);

      const videoId = urlObj.searchParams.get("v");

      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return "";
    }
  };

  const markAsWinner = async (id) => {
    try {
      if (!canDeclareWinner) {
        alert("You are not authorized to declare winner.");
        return;
      }

      await declareWinner(id);

      loadEngagementData();
    } catch (error) {
      console.log("Winner declare error:", error);
    }
  };

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

 /* ================= APPROVE ENTRY ================= */

const handleApprove = async (entryId) => {
  try {
    setModerationLoading(true);

    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://smartgaonadmin.duckdns.org/admin/gaon-talent/entries/${entryId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: "Approved after review",
        }),
      }
    );

    let text = "";
    try {
      text = await response.text();
    } catch {
      text = "";
    }

    console.log("APPROVE RESPONSE:", text);

    if (!response.ok) {
      throw new Error(text || "Approve failed");
    }

    alert("Video Approved Successfully");

    await loadEngagementData();

    setSelectedPost((prev) => ({
      ...prev,
      moderationStatus: "APPROVED",
    }));

  } catch (error) {
    console.log("APPROVE ERROR:", error);
    alert(error.message);
  } finally {
    setModerationLoading(false);
  }
};

/* ================= REJECT ENTRY ================= */

const handleReject = async () => {
  try {
    if (!rejectRemark.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    setModerationLoading(true);

    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `https://smartgaonadmin.duckdns.org/admin/gaon-talent/entries/${selectedPost.id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: rejectRemark,
        }),
      }
    );

    let rejectText = "";
    try {
      rejectText = await response.text();
    } catch {
      rejectText = "";
    }

    if (!response.ok) {
      throw new Error(rejectText || "Reject failed");
    }

    alert("Video Rejected");

    await loadEngagementData();

    setSelectedPost((prev) => ({
      ...prev,
      moderationStatus: "REJECTED",
      adminComment: rejectRemark,
    }));

    setShowRejectBox(false);
    setRejectRemark("");

  } catch (error) {
    console.log(error);
    alert("Reject failed");
  } finally {
    setModerationLoading(false);
  }
};

  /* ================= SEARCH ================= */

  const filteredUsers = users.filter((u) => {
    const text = searchValue.toLowerCase();

    return (
      u.name?.toLowerCase().includes(text) ||
      u.phone?.includes(text) ||
      u.villageOrArea?.toLowerCase().includes(text) ||
      getCompetitionName(u.competitionId)
        .toLowerCase()
        .includes(text) ||
      (u.referenceNumber || "")
        .toLowerCase()
        .includes(text)
    );
  });

  /* ================= SORT ================= */

  let sortedUsers = [...filteredUsers];

  if (likeFilter === "MOST_LIKED") {
    sortedUsers.sort((a, b) => b.likes - a.likes);
  } else if (likeFilter === "LEAST_LIKED") {
    sortedUsers.sort((a, b) => a.likes - b.likes);
  } else if (likeFilter === "MOST_COMMENTED") {
    sortedUsers.sort((a, b) => b.comments - a.comments);
  }

  /* ================= PAGINATION ================= */

  const indexOfLast = currentPage * pageSize;

  const indexOfFirst = indexOfLast - pageSize;

  const currentRows = sortedUsers.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    sortedUsers.length / pageSize
  );

  /* ================= SEARCH ACTION ================= */

  const performSearch = () => {
    setSearchValue(searchInput);

    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  /* ================= UI ================= */

  return (
    <div className="engagement-wrapper">

      

      {/* STATS CARDS */}
  {/* ================= STATS SECTION ================= */}

<div className="stats-section">

  {/* HEADER */}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "22px",
      flexWrap: "wrap",
      gap: "10px",
    }}
  >
    <h2 className="engagement-title">
      Engagement Overview
    </h2>

    <p className="engagement-subtitle">
      Manage competitions, reports, media and winners
    </p>
  </div>

  {/* GRID */}

<div className="eng-stats-grid">

    {/* POSTS */}

  <div className="eng-stat-card eng-posts">

  <div className="eng-stat-icon-box">
        📁
      </div>

     <div className="eng-stat-content">
<p className="eng-stat-label">
          Total Posts
        </p>

       <h2 className="eng-stat-value">
          {stats.totalPosts}
        </h2>

       <span className="eng-stat-subtext">
          All submitted posts
        </span>

      </div>

    </div>

    {/* COMPETITIONS */}

    <div className="eng-stat-card eng-competitions">

      <div className="eng-stat-icon-box">
        🎯
      </div>

      <div className="eng-stat-content">

        <p className="eng-stat-label">
          Total Competitions
        </p>

        <h2 className="eng-stat-value">
          {stats.totalCompetitions}
        </h2>

        <span className="eng-stat-subtext">
          Active competitions
        </span>

      </div>

    </div>

    {/* REPORTS */}

    <div className="eng-stat-card eng-reports">

      <div className="eng-stat-icon-box">
        🚨
      </div>

      <div className="eng-stat-content">

        <p className="eng-stat-label">
          Reported Posts
        </p>

        <h2 className="eng-stat-value">
         {stats.reportedPosts}
        </h2>

        <span className="eng-stat-subtext">
          Posts reported
        </span>

      </div>

    </div>

    {/* WINNERS */}

    <div className="eng-stat-card eng-winners">

      <div className="eng-stat-icon-box">
        🏆
      </div>

      <div className="eng-stat-content">

        <p className="eng-stat-label">
          Winners
        </p>

        <h2 className="eng-stat-value">
          {stats.totalWinners}
        </h2>

        <span className="eng-stat-subtext">
          Declared winners
        </span>

      </div>

    </div>

  </div>

</div>

{/* ================= SEARCH + FILTER ================= */}

      {/* SEARCH + FILTER */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Name, Phone, Category, Reference No..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="search-input"
        />

        <button onClick={performSearch} className="btn-search">
          Search
        </button>

        <button
          onClick={() => {
            setSearchInput("");
            setSearchValue("");
            setCurrentPage(1);
          }}
          className="btn-clear"
        >
          Clear
        </button>

        <select
          value={likeFilter}
          onChange={(e) => {
            setLikeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="NONE">No Filter</option>
          <option value="MOST_LIKED">Most Liked</option>
          <option value="LEAST_LIKED">Least Liked</option>
          <option value="MOST_COMMENTED">Most Commented</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="engagement-table">
          <thead>
            <tr>
              <th className="table-head">Participant</th>
              <th className="table-head">Competition</th>
              <th className="table-head">Activity</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((u) => (
              <tr key={u.id} className="table-row">

                {/* PARTICIPANT */}
                <td className="td-participant">
                  <div className="participant-name-row">
                    <span className="participant-name">{u.name}</span>

                    {u.winner && (
                      <span className="winner-badge">🏆 Winner</span>
                    )}

                    <div
                      className={`moderation-badge ${
                        u.moderationStatus === "APPROVED"
                          ? "approved"
                          : u.moderationStatus === "REJECTED"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {u.moderationStatus || "PENDING"}
                    </div>
                  </div>

                  <div className="participant-meta">
                    <span>📍 {u.villageOrArea || "N/A"}</span>
                    <span>📞 {u.phone || "N/A"}</span>
                    <span>🎂 {u.dob || "N/A"}</span>
                  </div>
                </td>

                {/* COMPETITION */}
                <td className="td-competition">
                  <div className="competition-inner">
                    <span className="category-badge">
                      🎤 {u.category || "N/A"}
                    </span>

                    <div className="competition-name">
                      🏁 {getCompetitionName(u.competitionId)}
                    </div>

                    <div className="reference-number">
                      Ref: {u.referenceNumber || "N/A"}
                    </div>
                  </div>
                </td>

                {/* ACTIVITY */}
                <td className="td-activity">
                  <div className="activity-chips">
                    <div className="chip-likes">❤️ {u.likes}</div>
                    <div className="chip-comments">💬 {u.comments}</div>
                    <div className={`chip-reports ${u.reportCount > 0 ? "has-reports" : "no-reports"}`}>
                      🚨 {u.reportCount ?? 0}
                    </div>
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="td-actions">
                  <div className="actions-col">
                    <div className="actions-row">

                      {/* VIEW MEDIA */}
                      <button
                        onClick={() => setSelectedPost(u)}
                        className="btn-view-media"
                      >
                        View Media
                      </button>

                      {/* WINNER */}
                      {canDeclareWinner && (
                        <>
                          {!u.winner ? (
                            <button
                              onClick={() => markAsWinner(u.id)}
                              className={`btn-declare-winner ${isWinnerDeclarationDisabled(u.moderationStatus) ? "disabled-btn" : ""}`}
                              disabled={isWinnerDeclarationDisabled(u.moderationStatus)}
                            >
                              Declare Winner
                            </button>
                          ) : (
                            <div>
                              <button className="btn-winner-done">
                                Winner ✓
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* REPORTS */}
                    {u.reportCount > 0 && (
                      <button
                        onClick={() => handleViewReports(u.id)}
                        className="btn-reports"
                      >
                        Reports
                      </button>
                    )}
                  </div>
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
          className="btn-page-nav"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`btn-page-num ${currentPage === page ? "active" : ""}`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="btn-page-nav"
        >
          Next
        </button>
      </div>

      {/* MEDIA MODAL */}
      {selectedPost && (
        <div className="modal-overlay">
          <div
            className={`modal-box ${
              isYouTubeShort(selectedPost.mediaUrl) ? "modal-box-shorts" : ""
            }`}
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedPost(null)}
              className="modal-close-btn"
            >
              ✕
            </button>

            <div className="modal-body">

              {/* IMAGE */}
              {isImage(selectedPost.mediaUrl) && (
                <img
                  src={selectedPost.mediaUrl}
                  alt="Media"
                  className="modal-image"
                />
              )}

              {/* VIDEO */}
              {isVideo(selectedPost.mediaUrl) && (
                <video controls className="modal-video">
                  <source src={selectedPost.mediaUrl} />
                </video>
              )}

              {/* ================= FIXED YOUTUBE PLAYER ================= */}
              {isYouTube(selectedPost.mediaUrl) && (
                <div
                  className={`youtube-wrapper ${
                    isYouTubeShort(selectedPost.mediaUrl)
                      ? "youtube-wrapper-shorts"
                      : ""
                  }`}
                >
                  <iframe
                    src={getYoutubeEmbedUrl(selectedPost.mediaUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={`youtube-iframe ${
                      isYouTubeShort(selectedPost.mediaUrl)
                        ? "youtube-iframe-shorts"
                        : ""
                    }`}
                  />
                </div>
              )}

              {/* NO MEDIA */}
              {!selectedPost.mediaUrl && (
                <div className="no-media-msg">No Media Available</div>
              )}

              {/* STATS + ACTIONS */}
              <div className="modal-actions-row">

                {/* LIKES */}
                <div className="modal-chip-likes">
                  ❤️ Likes: {selectedPost.likes}
                </div>

                {/* COMMENTS */}
                <div className="modal-chip-comments">
                  💬 Comments: {selectedPost.comments}
                </div>

                {/* REPORTS */}
                <div className={`modal-chip-reports ${selectedPost.reportCount > 0 ? "has-reports" : "no-reports"}`}>
                  🚨 Reports: {selectedPost.reportCount ?? 0}
                </div>

                {/* APPROVE BUTTON */}
                <button
                  onClick={() => {
                    console.log("APPROVE CLICKED", selectedPost.id);
                    handleApprove(selectedPost.id);
                  }}
                  disabled={moderationLoading}
                  className={`btn-approve ${selectedPost?.moderationStatus === "APPROVED" ? "dimmed" : ""}`}
                >
                  {selectedPost?.moderationStatus === "APPROVED"
                    ? "✅ Approved"
                    : "Approve"}
                </button>

                {/* REJECT BUTTON */}
                <button
                  onClick={() => {
                    console.log("REJECT CLICKED");
                    setShowRejectBox(true);
                  }}
                  disabled={moderationLoading}
                  className={`btn-reject ${selectedPost?.moderationStatus === "REJECTED" ? "dimmed" : ""}`}
                >
                  {selectedPost?.moderationStatus === "REJECTED"
                    ? "❌ Rejected"
                    : "Reject"}
                </button>
              </div>

              {/* REJECTION COMMENT */}
              {selectedPost?.moderationStatus === "REJECTED" &&
                selectedPost?.adminComment && (
                  <div className="rejection-comment-box">
                    Rejection Reason: {selectedPost.adminComment}
                  </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectBox && (
        <div className="reject-modal-overlay">
          <div className="reject-modal-box">
            <h3 className="reject-modal-title">Reject Video</h3>

            <textarea
              placeholder="Enter rejection reason..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              className="reject-textarea"
            />

            <div className="reject-modal-footer">
              <button
                onClick={() => setShowRejectBox(false)}
                className="btn-cancel"
              >
                Cancel
              </button>

              <button onClick={handleReject} className="btn-submit-reject">
                Submit Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReports && (
        <ReportModal
          reports={reports}
          onClose={() => setShowReports(false)}
        />
      )}
    </div>
  );
}
