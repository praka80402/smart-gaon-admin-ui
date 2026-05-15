import { useEffect, useState, useCallback } from "react";
import "./forum.css";

import {
  getAllForumPosts,
  deleteForumPost,
  getForumPostReports,
  approveForumPost,
  rejectForumPost,
} from "../services/forumService";
import ReportModal from "./ReportModal";

const isVideo = (url = "") =>
  /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);

const isYouTube = (url = "") =>
  url.includes("youtube.com") ||
  url.includes("youtu.be") ||
  url.includes("youtube.com/shorts/");

const isYouTubeShort = (url = "") =>
  url.includes("/shorts/");

const getYoutubeEmbedUrl = (url = "") => {
  if (!url) return "";
  try {
    if (url.includes("/shorts/")) {
      const videoId = url.split("/shorts/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop()?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return "";
  }
};

const getForumMedia = (post) => {
  const attachments = Array.isArray(post?.mediaAttachments)
    ? post.mediaAttachments
    : post?.mediaAttachments
    ? [post.mediaAttachments]
    : [];

  const mappedAttachments = attachments
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.url || item?.mediaUrl || item?.fileUrl;
    })
    .filter(Boolean);

  const extraMedia = [
    post?.youtubeVideoUrl,
    post?.youtubeUrl,
    post?.videoUrl,
    post?.mediaUrl,
  ].filter(Boolean);

  return [...new Set([...mappedAttachments, ...extraMedia])];
};

/* ────────────────────────────────────────────────
   MediaPreviewStrip  –  multiple media support
   Shows main preview + clickable thumbnail strip
──────────────────────────────────────────────── */
const MediaPreviewStrip = ({ allMedia }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (allMedia.length === 0) {
    return <div className="sg-forum-no-media">No Media</div>;
  }

  const active = allMedia[activeIdx];

  const renderMain = (url) => {
    if (isVideo(url)) {
      return (
        <video
          key={url}
          src={url}
          className="sg-forum-media"
          controls
          muted
        />
      );
    }
    if (isYouTube(url)) {
      return (
        <iframe
          key={url}
          src={getYoutubeEmbedUrl(url)}
          className="sg-forum-media"
          title="YouTube video"
          allowFullScreen
          frameBorder="0"
        />
      );
    }
    return (
      <img
        key={url}
        src={url}
        alt={`media-${activeIdx}`}
        className="sg-forum-media"
      />
    );
  };

  return (
    <div className="sg-forum-media-wrapper">
      {/* Main preview */}
      <div className="sg-forum-media-main">
        {renderMain(active)}
      </div>

      {/* Thumbnail strip — only if more than 1 media */}
      {allMedia.length > 1 && (
        <div className="sg-forum-media-strip">
          {allMedia.map((url, idx) => (
            <div
              key={idx}
              className={`sg-forum-thumb${idx === activeIdx ? " active" : ""}`}
              onClick={() => setActiveIdx(idx)}
            >
              {isVideo(url) || isYouTube(url) ? (
                <div className="sg-forum-thumb-video-icon">&#9654;</div>
              ) : (
                <img src={url} alt={`thumb-${idx}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter badge */}
      {allMedia.length > 1 && (
        <div className="sg-forum-media-count">
          {activeIdx + 1} / {allMedia.length}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────
   Main Forum Component
──────────────────────────────────────────────── */
const Forum = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchPhone, setSearchPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportMedia, setReportMedia] = useState([]);
  const [reportPostTitle, setReportPostTitle] = useState("");
  const [selectedReportPost, setSelectedReportPost] = useState(null);
  const [selectedContentPost, setSelectedContentPost] = useState(null);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const pageSize = 5;
  const role = localStorage.getItem("adminRole");
  const canDelete = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  /* LOAD */
  const load = useCallback(
    async (pageNo = page) => {
      setLoading(true);
      try {
        const res = await getAllForumPosts({
          page: pageNo,
          size: pageSize,
          phone: searchPhone || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        const data = res.data;
        setItems(data?.content || []);
        setPage(data?.number || 0);
        setTotalPages(data?.totalPages || 0);
        setTotalPosts(data?.totalElements || 0);
      } catch (e) {
        console.error(e);
        setItems([]);
        setPage(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [searchPhone, fromDate, toDate, page]
  );

  useEffect(() => { load(0); }, []);

  /* DELETE */
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteForumPost(postId);
      load(page);
    } catch (e) {
      console.error(e);
    }
  };

  /* VIEW REPORTS */
  const handleViewReports = async (post) => {
    try {
      const res = await getForumPostReports(post.postId);
      const allMedia = getForumMedia(post);
      setReports(Array.isArray(res.data) ? res.data : res.data?.content || []);
      setReportMedia(allMedia);
      setReportPostTitle(post.title || "Post");
      setSelectedReportPost(post);
      setShowReports(true);
    } catch (e) {
      console.error(e);
    }
  };

  /* PAGINATION */
  const prevPage = () => { if (page > 0) load(page - 1); };
  const nextPage = () => { if (page < totalPages - 1) load(page + 1); };

  const handleApprove = async () => {
    if (!selectedReportPost?.postId) return;
    try {
      setModerationLoading(true);
      await approveForumPost(selectedReportPost.postId);
      await load(page);
      setSelectedReportPost((prev) =>
        prev ? { ...prev, moderationStatus: "APPROVED" } : prev
      );
    } catch (e) {
      console.error(e);
      alert("Approve failed");
    } finally {
      setModerationLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReportPost?.postId) return;
    if (!rejectRemark.trim()) {
      alert("Please enter rejection reason");
      return;
    }
    try {
      setModerationLoading(true);
      await rejectForumPost(selectedReportPost.postId, rejectRemark);
      await load(page);
      setSelectedReportPost((prev) =>
        prev
          ? { ...prev, moderationStatus: "REJECTED", adminComment: rejectRemark }
          : prev
      );
      setShowRejectBox(false);
      setRejectRemark("");
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    } finally {
      setModerationLoading(false);
    }
  };

  return (
    <div className="sg-forum-page">
      <div className="sg-forum-content-shell">

        {/* HEADER */}
        <div className="sg-forum-topbar">
          <div>
            <h2 className="sg-forum-heading">Forum Posts</h2>
            <p className="sg-forum-subheading">
              Manage and moderate community discussions.
            </p>
          </div>
          <div className="sg-forum-total-card">
            <div className="sg-forum-total-icon">&#x1F4AC;</div>
            <div>
              <p className="sg-forum-total-label">Total Posts</p>
              <h3 className="sg-forum-total-value">{totalPosts}</h3>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="sg-forum-filter-wrap">
          <input
            type="text"
            placeholder="Search phone number..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="sg-forum-search-input"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="sg-forum-date-input"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="sg-forum-date-input"
          />
          <button className="sg-forum-search-btn" onClick={() => load(0)}>
            Search
          </button>
          <button
            className="sg-forum-clear-btn"
            onClick={() => {
              setSearchPhone("");
              setFromDate("");
              setToDate("");
              load(0);
            }}
          >
            Clear
          </button>
        </div>

        {/* POSTS CONTAINER */}
        <div className="sg-forum-post-container">
          <div className="sg-forum-list">

            {loading && (
              <div className="sg-forum-empty">Loading...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="sg-forum-empty">No forum posts found</div>
            )}

            {!loading &&
              items.map((item) => {
                const allMedia = getForumMedia(item);
                return (
                  <div className="sg-forum-card" key={item.postId}>

                    {/* LEFT */}
                    <div className="sg-forum-user-section">
                      <div className="sg-forum-user-row">
                        <div className="sg-forum-avatar">
                          {item.user?.firstName?.charAt(0)}
                        </div>
                        <div className="sg-forum-user-meta">
                          <h4 className="sg-forum-user-name">
                            {item.user
                              ? `${item.user.firstName} ${item.user.lastName}`
                              : "Unknown"}
                          </h4>
                          <p className="sg-forum-phone">
                            📞 {item.user?.phone || "—"}
                          </p>
                          <p className="sg-forum-date">
                            📅{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CENTER */}
                    <div className="sg-forum-content-section">
                      <div className="sg-forum-category">
                        {item.category || "General"}
                      </div>
                      <h3 className="sg-forum-post-title">
                        {item.title || "Untitled"}
                      </h3>
                      <p className="sg-forum-post-content">
                        {item.content?.length > 140
                          ? `${item.content.slice(0, 140)}...`
                          : item.content}
                      </p>
                      {item.content?.length > 140 && (
                        <button
                          className="sg-forum-view-more-btn"
                          onClick={() => setSelectedContentPost(item)}
                        >
                          View More
                        </button>
                      )}
                    </div>

                    {/* ACTIVITY */}
                    <div className="sg-forum-activity-section">
                      <div className="sg-forum-stat-box">
                        ❤️ {item.likeCount ?? 0}
                      </div>
                      <div className="sg-forum-stat-box">
                        💬 {item.commentCount ?? 0}
                      </div>
                      <div className="sg-forum-stat-box danger">
                        🚨 {item.reportCount ?? 0}
                      </div>
                    </div>

                    {/* MEDIA – multiple preview */}
                    <div className="sg-forum-media-section">
                      <MediaPreviewStrip allMedia={allMedia} />
                    </div>

                    {/* ACTIONS */}
                    <div className="sg-forum-action-section">
                      <button
                        className="sg-forum-view-btn"
                        onClick={() => handleViewReports(item)}
                      >
                        Action
                      </button>
                      {canDelete && (
                        <button
                          className="sg-forum-delete-btn"
                          onClick={() => handleDelete(item.postId)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="sg-forum-pagination">
          <button
            onClick={prevPage}
            disabled={page === 0}
            className="sg-forum-page-btn"
          >
            Previous
          </button>
          <span className="sg-forum-page-number">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={page === totalPages - 1}
            className="sg-forum-page-btn active"
          >
            Next
          </button>
        </div>

        {/* REPORT MODAL */}
        {showReports && (
          <ReportModal
            reports={reports}
            media={reportMedia}
            postTitle={reportPostTitle}
            isVideo={isVideo}
            isYouTube={isYouTube}
            isYouTubeShort={isYouTubeShort}
            getYoutubeEmbedUrl={getYoutubeEmbedUrl}
            selectedPost={selectedReportPost}
            moderationLoading={moderationLoading}
            onApprove={handleApprove}
            onOpenReject={() => setShowRejectBox(true)}
            onClose={() => {
              setShowReports(false);
              setReports([]);
              setReportMedia([]);
              setReportPostTitle("");
              setSelectedReportPost(null);
              setShowRejectBox(false);
              setRejectRemark("");
            }}
          />
        )}

        {/* REJECT BOX */}
        {showRejectBox && (
          <div className="sg-forum-content-modal-backdrop">
            <div className="sg-forum-reject-modal">
              <h3>Reject Post</h3>
              <textarea
                className="sg-forum-reject-textarea"
                placeholder="Enter rejection reason..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
              <div className="sg-forum-reject-actions">
                <button
                  className="sg-forum-clear-btn"
                  onClick={() => setShowRejectBox(false)}
                >
                  Cancel
                </button>
                <button
                  className="sg-forum-delete-btn"
                  onClick={handleReject}
                  disabled={moderationLoading}
                >
                  Submit Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT FULL VIEW MODAL */}
        {selectedContentPost && (
          <div
            className="sg-forum-content-modal-backdrop"
            onClick={() => setSelectedContentPost(null)}
          >
            <div
              className="sg-forum-content-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sg-forum-content-modal-header">
                <h3>{selectedContentPost.title || "Post Content"}</h3>
                <button
                  className="sg-forum-content-close"
                  onClick={() => setSelectedContentPost(null)}
                >
                  x
                </button>
              </div>
              <div className="sg-forum-content-modal-body">
                <div className="sg-forum-category">
                  {selectedContentPost.category || "General"}
                </div>
                <p className="sg-forum-content-full-text">
                  {selectedContentPost.content || "No content available"}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Forum;
