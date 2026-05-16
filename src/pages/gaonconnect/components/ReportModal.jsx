import React, { useState } from "react";
import "./forum.css";

const ReportModal = ({
  reports = [],
  media = [],
  postTitle = "",
  isVideo = () => false,
  isYouTube = () => false,
  isYouTubeShort = () => false,
  getYoutubeEmbedUrl = () => "",
  selectedPost = null,
  moderationLoading = false,
  onApprove,
  onOpenReject,
  onOpenApprove,
  onClose,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const goPrev = () => setActiveIdx((i) => (i > 0 ? i - 1 : media.length - 1));
  const goNext = () => setActiveIdx((i) => (i < media.length - 1 ? i + 1 : 0));

  const renderSlide = (url) => {
    if (isYouTube(url)) {
      return (
        <iframe
          src={getYoutubeEmbedUrl(url)}
          title="youtube media"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="gc-slide-iframe"
        />
      );
    }
    if (isVideo(url)) {
      return <video src={url} controls className="gc-slide-media" />;
    }
    return (
      <img
        src={url}
        alt={`media ${activeIdx + 1}`}
        className="gc-slide-media"
      />
    );
  };

  return (
    <div className="gc-modal-overlay">
      <div className="gc-modal gc-modal-slideshow">

        {/* HEADER */}
        <div className="gc-modal-header">
          <h3>{postTitle || "View Media"}</h3>
          <button className="gc-modal-close-icon gc-modal-close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* SLIDESHOW */}
        {media.length > 0 ? (
          <div className="gc-slideshow-wrap">
            {media.length > 1 && (
              <button className="gc-slide-arrow gc-slide-arrow-left" onClick={goPrev}>
                &#8249;
              </button>
            )}
            <div className="gc-slide-main">
              {renderSlide(media[activeIdx])}
            </div>
            {media.length > 1 && (
              <button className="gc-slide-arrow gc-slide-arrow-right" onClick={goNext}>
                &#8250;
              </button>
            )}
            {media.length > 1 && (
              <div className="gc-slide-footer">
                <div className="gc-slide-dots">
                  {media.map((_, i) => (
                    <span
                      key={i}
                      className={`gc-slide-dot${i === activeIdx ? " active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    />
                  ))}
                </div>
                <div className="gc-slide-counter">
                  {activeIdx + 1} / {media.length}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="gc-empty" style={{ padding: "32px" }}>
            No image or video attached
          </div>
        )}

        {/* MODERATION BAR */}
        {selectedPost && (
          <div className="gc-forum-moderation-bar">
            <div className="gc-forum-moderation-status">
              Status: {selectedPost.moderationStatus || "PENDING"}
            </div>

            <button
              className={`gc-forum-approve-btn ${selectedPost?.moderationStatus === "APPROVED" ? "dimmed" : ""}`}
              onClick={onOpenApprove}
              disabled={moderationLoading}
            >
              {selectedPost?.moderationStatus === "APPROVED" ? "✓ Approved" : "Approve"}
            </button>

            <button
              className={`gc-forum-reject-btn ${selectedPost?.moderationStatus === "REJECTED" ? "dimmed" : ""}`}
              onClick={onOpenReject}
              disabled={moderationLoading}
            >
              {selectedPost?.moderationStatus === "REJECTED" ? "✗ Rejected" : "Reject"}
            </button>
          </div>
        )}

        {/* Admin comment display */}
        {selectedPost?.moderationStatus === "APPROVED" && selectedPost?.adminComment && (
          <div className="gc-forum-admin-comment gc-forum-admin-comment--approved">
            ✅ Approval Reason: {selectedPost.adminComment}
          </div>
        )}
        {selectedPost?.moderationStatus === "REJECTED" && selectedPost?.adminComment && (
          <div className="gc-forum-admin-comment">
            ❌ Rejection Reason: {selectedPost.adminComment}
          </div>
        )}

        {/* REPORT LIST */}
        <div className="gc-report-list-wrap">
          <h4 className="gc-report-list-title">Report Reasons</h4>
          {reports.length === 0 ? (
            <div className="gc-empty">No reports found</div>
          ) : (
            <div className="gc-report-card-list">
              {reports.map((r) => (
                <div className="gc-report-card" key={r.reportId}>
                  <div className="gc-report-card-top">
                    <div>
                      <b>{r.reportedByUserName}</b>
                      <div className="gc-muted">ID: {r.reportedByUserId}</div>
                    </div>
                    <span className="gc-report-reason">{r.reason}</span>
                  </div>
                  <p className="gc-report-card-remark">
                    {r.customReason || "No custom remark"}
                  </p>
                  <div className="gc-report-card-date">
                    {r.reportedAt ? new Date(r.reportedAt).toLocaleString() : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="gc-modal-footer">
          <button className="gc-btn-close" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportModal;
