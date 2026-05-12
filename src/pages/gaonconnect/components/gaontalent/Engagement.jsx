import { useEffect, useState, useCallback } from "react";
import {
  getAllCompetitions,
  declareWinner,
  getTalentEntriesWithReports,
  getTalentEntryReports,
} from "../../services/gaonTalentService";
import ReportModal from "../ReportModal";

export default function Engagement() {
  
  /* ================= ROLE CONTROL ================= */

  const role = localStorage.getItem("adminRole");

  const canDeclareWinner =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  /* ================= STATE ================= */

  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
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
    <div
      style={{
        padding: "24px 8px",
        background: "#eef7f6",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* HEADER */}

      <div
  style={{
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  }}
>
        <h2
          style={{
            fontSize: "20px",
            color: "#124734",
            marginBottom: "6px",
            fontWeight: "700",
          }}
        >
          Engagement Overview
        </h2>

        <p
  style={{
    color: "#5f6d68",
    fontSize: "13px",
    margin: 0,
  }}
>
          Manage competitions, reports, media and winners
        </p>
      </div>
            {/* STATS CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
         "repeat(auto-fit,minmax(160px,1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            title: "Total Posts",
            value: users.length,
            icon: "📁",
            border: "#dcefe6",
          },

          {
            title: "Total Competitions",
            value: competitions.length,
            icon: "🎯",
            border: "#d8ebff",
          },

          {
            title: "Reported Posts",
            value: users.filter(
              (u) => u.reportCount > 0
            ).length,
            icon: "🚨",
            border: "#ffe0e0",
          },

          {
            title: "Winners",
            value: users.filter((u) => u.winner).length,
            icon: "🏆",
            border: "#ffe9bf",
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "#ffffff",
              padding: "12px",
              borderRadius: "12px",
              border: `1px solid ${item.border}`,
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  color: "#5f6d68",
                  fontSize: "15px",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                {item.title}
              </p>

              <span
                style={{
                  fontSize: "24px",
                }}
              >
                {item.icon}
              </span>
            </div>

            <h2
              style={{
                color: "#176b4d",
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}

      <div
        style={{
          display: "flex",
          gap: "14px",
          marginBottom: "24px",
          flexWrap: "wrap",
          background: "white",
          padding: "18px",
          borderRadius: "18px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="Search by Name, Phone, Category, Reference No..."
          value={searchInput}
          onChange={(e) =>
            setSearchInput(e.target.value)
          }
          onKeyDown={handleKeyPress}
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #d7e3df",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <button
          onClick={performSearch}
          style={{
            background: "#176b4d",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          Search
        </button>
        <button
  onClick={() => {
    setSearchInput("");
    setSearchValue("");
    setCurrentPage(1);
  }}
  style={{
    background: "#e2e8f0",
    color: "#334155",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  }}
>
  Clear
</button>

        <select
          value={likeFilter}
          onChange={(e) => {
            setLikeFilter(e.target.value);

            setCurrentPage(1);
          }}
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid #d7e3df",
            minWidth: "220px",
            background: "white",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          <option value="NONE">No Filter</option>

          <option value="MOST_LIKED">
            Most Liked
          </option>

          <option value="LEAST_LIKED">
            Least Liked
          </option>

          <option value="MOST_COMMENTED">
            Most Commented
          </option>
        </select>
      </div>

      {/* TABLE */}

      <div
  style={{
    background: "white",
    borderRadius: "20px",
    overflowX: "auto",
    overflowY: "auto",

    /* IMPORTANT */
    maxHeight: "65vh",

    width: "100%",

    boxShadow:
      "0 4px 14px rgba(0,0,0,0.06)",
  }}
>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "1100px",
          }}
        >
          <thead
            style={{
              background: "#f1f5f9",
            }}
          >
            <tr>
              <th style={tableHead}>Participant</th>

              <th style={tableHead}>Competition</th>

              <th style={tableHead}>Activity</th>

              <th style={tableHead}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((u) => (
              <tr
                key={u.id}
                style={{
                  borderBottom: "1px solid #edf2f7",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "#f8fbff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "white";
                }}
              >
                {/* PARTICIPANT */}

                <td
                  style={{
                    padding: "18px 16px",
                    verticalAlign: "top",
                    minWidth: "280px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "15px",
                        color: "#1e293b",
                      }}
                    >
                      {u.name}
                    </span>

                    {u.winner && (
                      <span
                        style={{
                          background: "#e7f7ee",
                          color: "#178248",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        🏆 Winner
                      </span>
                    )}

                    <div
  style={{
    marginTop: "6px",

    background:
      u.moderationStatus === "APPROVED"
        ? "#dcfce7"
        : u.moderationStatus === "REJECTED"
        ? "#fee2e2"
        : "#fef3c7",

    color:
      u.moderationStatus === "APPROVED"
        ? "#166534"
        : u.moderationStatus === "REJECTED"
        ? "#991b1b"
        : "#92400e",

    padding: "4px 12px",

    borderRadius: "30px",

    fontSize: "11px",

    fontWeight: "700",

    width: "fit-content",
  }}
>
  {u.moderationStatus || "PENDING"}
</div>
                  </div>

                  <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    color: "#475569",
    fontSize: "13px",
    marginTop: "6px",
  }}
>
  <span>
    📍 {u.villageOrArea || "N/A"}
  </span>

  <span>
    📞 {u.phone || "N/A"}
  </span>

  <span>
    🎂 {u.dob || "N/A"}
  </span>
</div>
                </td>

                {/* COMPETITION */}

                <td
                  style={{
                    padding: "18px 16px",
                    verticalAlign: "top",
                    minWidth: "250px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        background: "#eef5ff",
                        color: "#2563eb",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        width: "fit-content",
                      }}
                    >
                      🎤 {u.category || "N/A"}
                    </span>

                    <div
                      style={{
                        color: "#1e293b",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "1.5",
                      }}
                    >
                      🏁{" "}
                      {getCompetitionName(
                        u.competitionId
                      )}
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                        wordBreak: "break-word",
                      }}
                    >
                      Ref:{" "}
                      {u.referenceNumber || "N/A"}
                    </div>
                  </div>
                </td>

                {/* ACTIVITY */}

                <td
                  style={{
                    padding: "18px 16px",
                    verticalAlign: "top",
                    minWidth: "220px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      ❤️ {u.likes}
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        color: "#475569",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      💬 {u.comments}
                    </div>

                    <div
                      style={{
                        background:
                          u.reportCount > 0
                            ? "#ffe5e5"
                            : "#eef7ee",

                        color:
                          u.reportCount > 0
                            ? "#d11a2a"
                            : "#178248",

                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      🚨 {u.reportCount ?? 0}
                    </div>
                  </div>
                </td>

                {/* ACTIONS */}

                <td
                  style={{
                    padding: "18px 16px",
                    verticalAlign: "top",
                    minWidth: "280px",
                  }}
                >
                  <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "220px",
  }}
>
  <div
    style={{
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    }}
  >
    {/* VIEW MEDIA */}

    <button
      onClick={() => setSelectedPost(u)}
      style={{
        background: "#3478f6",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "12px",
      }}
    >
      View Media
    </button>

    {/* WINNER */}

    {canDeclareWinner && (
      <>
        {!u.winner ? (
          <button
            onClick={() => markAsWinner(u.id)}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Declare Winner
          </button>
        ) : (
          <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "flex-start",
  }}
>
  <button
    style={{
      background: "#dcfce7",
      color: "#15803d",
      border: "none",
      padding: "8px 14px",
      borderRadius: "10px",
      fontWeight: "700",
      fontSize: "12px",
      cursor: "pointer",
    }}
  >
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
      style={{
        background: "#6c757d",
        color: "white",
        border: "none",
        padding: "8px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "12px",
        width: "fit-content",
      }}
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginTop: "24px",
          flexWrap: "wrap",
        }}
      >
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((p) => p - 1)
          }
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "#ffffff",
            fontWeight: "600",
          }}
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              minWidth: "42px",
              height: "42px",
              borderRadius: "10px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",

              background:
                currentPage === page
                  ? "#176b4d"
                  : "white",

              color:
                currentPage === page
                  ? "white"
                  : "#222",
            }}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((p) => p + 1)
          }
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background: "#ffffff",
            fontWeight: "600",
          }}
        >
          Next
        </button>
      </div>

      {/* MEDIA MODAL */}

      {selectedPost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "900px",
              borderRadius: "18px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* CLOSE BUTTON */}

            <button
              onClick={() => setSelectedPost(null)}
              style={{
                position: "absolute",
                right: "14px",
                top: "14px",
                border: "none",
                background: "red",
                color: "white",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <div
              style={{
                padding: "20px",
              }}
            >
                          {/* IMAGE */}

              {isImage(selectedPost.mediaUrl) && (
                <img
                  src={selectedPost.mediaUrl}
                  alt="Media"
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: "14px",
                    background: "#000",
                  }}
                />
              )}

              {/* VIDEO */}

              {isVideo(selectedPost.mediaUrl) && (
                <video
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    borderRadius: "14px",
                    background: "#000",
                  }}
                >
                  <source
                    src={selectedPost.mediaUrl}
                  />
                </video>
              )}

              {/* ================= FIXED YOUTUBE PLAYER ================= */}

              {isYouTube(selectedPost.mediaUrl) && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <iframe
                    src={getYoutubeEmbedUrl(
                      selectedPost.mediaUrl
                    )}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      maxWidth: "500px",

                      /* FIXED HEIGHT */
                      height: "70vh",

                      /* SHORTS SUPPORT */
                      aspectRatio: "9/16",

                      borderRadius: "14px",

                      background: "#000",
                    }}
                  />
                </div>
              )}

              {/* NO MEDIA */}

              {!selectedPost.mediaUrl && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  No Media Available
                </div>
              )}

             
              
              {/* STATS + ACTIONS */}

              <div
                style={{
                  marginTop: "20px",

                  display: "flex",

                  gap: "14px",

                  flexWrap: "wrap",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                {/* LIKES */}

                <div
                  style={{
                    background: "#eff6ff",

                    color: "#2563eb",

                    padding: "10px 16px",

                    borderRadius: "12px",

                    fontWeight: "600",
                  }}
                >
                  ❤️ Likes:
                  {" "}
                  {selectedPost.likes}
                </div>

                {/* COMMENTS */}

                <div
                  style={{
                    background: "#f8fafc",

                    color: "#475569",

                    padding: "10px 16px",

                    borderRadius: "12px",

                    fontWeight: "600",
                  }}
                >
                  💬 Comments:
                  {" "}
                  {selectedPost.comments}
                </div>

                {/* REPORTS */}

                <div
                  style={{
                    background:
                      selectedPost.reportCount > 0
                        ? "#ffe5e5"
                        : "#eef7ee",

                    color:
                      selectedPost.reportCount > 0
                        ? "#d11a2a"
                        : "#178248",

                    padding: "10px 16px",

                    borderRadius: "12px",

                    fontWeight: "700",
                  }}
                >
                  🚨 Reports:
                  {" "}
                  {selectedPost.reportCount ?? 0}
                </div>

                {/* APPROVE BUTTON */}

                <button
                  onClick={() => {
                    console.log(
                      "APPROVE CLICKED",
                      selectedPost.id
                    );

  handleApprove(selectedPost.id);
}}
                  
                  disabled={moderationLoading}
                  style={{
                    background: "#16a34a",

                    color: "white",

                    border: "none",

                    padding: "10px 18px",

                    borderRadius: "12px",

                    cursor: "pointer",

                    fontWeight: "700",

                    fontSize: "14px",

                    opacity:
                      selectedPost?.moderationStatus ===
                      "APPROVED"
                        ? 0.7
                        : 1,
                  }}
                >
                  {selectedPost?.moderationStatus ===
                  "APPROVED"
                    ? "✅ Approved"
                    : "Approve"}
                </button>

                {/* REJECT BUTTON */}

                <button
                  onClick={() => {
  console.log(
    "REJECT CLICKED"
  );

  setShowRejectBox(true);
}}
                  disabled={moderationLoading}
                  style={{
                    background: "#dc2626",

                    color: "white",

                    border: "none",

                    padding: "10px 18px",

                    borderRadius: "12px",

                    cursor: "pointer",

                    fontWeight: "700",

                    fontSize: "14px",

                    opacity:
                      selectedPost?.moderationStatus ===
                      "REJECTED"
                        ? 0.7
                        : 1,
                  }}
                >
                  {selectedPost?.moderationStatus ===
                  "REJECTED"
                    ? "❌ Rejected"
                    : "Reject"}
                </button>
              </div>

              {/* REJECTION COMMENT */}

{selectedPost?.moderationStatus ===
  "REJECTED" &&
  selectedPost?.adminComment && (
    <div
      style={{
        marginTop: "18px",
        padding: "14px 18px",
        background: "#fff1f2",
        border:
          "1px solid #fecdd3",
        borderRadius: "14px",
        color: "#be123c",
        fontWeight: "600",
        fontSize: "15px",
        textAlign: "center",
      }}
    >
      Rejection Reason:{" "}
      {selectedPost.adminComment}
    </div>
)}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}

      {showRejectBox && (
        <div
          style={{
            position: "fixed",

            top: 0,

            left: 0,

            width: "100%",

            height: "100%",

            background:
              "rgba(0,0,0,0.5)",

            display: "flex",

            justifyContent: "center",

            alignItems: "center",

            zIndex: 999999,
          }}
        >
          <div
            style={{
              width: "420px",

              background: "white",

              borderRadius: "18px",

              padding: "24px",
            }}
          >
            <h3
              style={{
                marginBottom: "16px",

                color: "#111827",
              }}
            >
              Reject Video
            </h3>

            <textarea
              placeholder="Enter rejection reason..."
              value={rejectRemark}
              onChange={(e) =>
                setRejectRemark(
                  e.target.value
                )
              }
              style={{
                width: "100%",

                minHeight: "140px",

                border:
                  "1px solid #d1d5db",

                borderRadius: "12px",

                padding: "12px",

                outline: "none",

                resize: "none",

                fontSize: "14px",
              }}
            />

            <div
              style={{
                marginTop: "18px",

                display: "flex",

                justifyContent:
                  "flex-end",

                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  setShowRejectBox(false)
                }
                style={{
                  background: "#e5e7eb",

                  border: "none",

                  padding: "10px 18px",

                  borderRadius: "10px",

                  cursor: "pointer",

                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                style={{
                  background: "#dc2626",

                  color: "white",

                  border: "none",

                  padding: "10px 18px",

                  borderRadius: "10px",

                  cursor: "pointer",

                  fontWeight: "700",
                }}
              >
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
          onClose={() =>
            setShowReports(false)
          }
        />
      )}
    </div>
  );
}

/* ================= COMMON STYLES ================= */

const tableHead = {
  padding: "16px",

  textAlign: "left",

  color: "#334155",

  fontWeight: "700",

  fontSize: "13px",

  borderBottom:
    "1px solid #e2e8f0",
};

