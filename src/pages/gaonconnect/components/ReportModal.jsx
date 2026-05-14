import React from "react";
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
  onClose,
}) => {
  const hasShortMedia = media.some((item) => isYouTubeShort(item));

  return (
    <div className="gc-modal-overlay">
      <div className={`gc-modal ${hasShortMedia ? "gc-modal-shorts" : ""}`}>
        <div className="gc-modal-header">
          <h3>View Media</h3>
          <button className="gc-modal-close-icon" onClick={onClose}>
            x
          </button>
        </div>

        {(postTitle || media.length > 0) && (
          <div className="gc-report-media-block">
            {postTitle && (
              <p className="gc-report-post-title">{postTitle}</p>
            )}

            {media.length > 0 ? (
              <div className={`gc-report-media-grid ${hasShortMedia ? "gc-report-media-grid-shorts" : ""}`}>
                {media.map((item, index) =>
                  isYouTube(item) ? (
                    <div
                      key={`${item}-${index}`}
                      className={`gc-youtube-wrapper ${isYouTubeShort(item) ? "gc-youtube-wrapper-shorts" : ""}`}
                    >
                      <iframe
                        src={getYoutubeEmbedUrl(item)}
                        title={`youtube media ${index + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={`gc-youtube-iframe ${isYouTubeShort(item) ? "gc-youtube-iframe-shorts" : ""}`}
                      />
                    </div>
                  ) : isVideo(item) ? (
                    <video
                      key={`${item}-${index}`}
                      src={item}
                      controls
                      className="gc-report-media"
                    />
                  ) : (
                    <img
                      key={`${item}-${index}`}
                      src={item}
                      alt={`report media ${index + 1}`}
                      className="gc-report-media"
                    />
                  )
                )}
              </div>
            ) : (
              <div className="gc-empty">
                No image or video attached
              </div>
            )}
          </div>
        )}

        {selectedPost && (
          <div className="gc-forum-moderation-bar">
            <div className="gc-forum-moderation-status">
              Status: {selectedPost.moderationStatus || "PENDING"}
            </div>

            <button
              className={`gc-forum-approve-btn ${selectedPost?.moderationStatus === "APPROVED" ? "dimmed" : ""}`}
              onClick={onApprove}
              disabled={moderationLoading}
            >
              {selectedPost?.moderationStatus === "APPROVED" ? "Approved" : "Approve"}
            </button>

            <button
              className={`gc-forum-reject-btn ${selectedPost?.moderationStatus === "REJECTED" ? "dimmed" : ""}`}
              onClick={onOpenReject}
              disabled={moderationLoading}
            >
              {selectedPost?.moderationStatus === "REJECTED" ? "Rejected" : "Reject"}
            </button>
          </div>
        )}

        {selectedPost?.moderationStatus === "REJECTED" &&
          selectedPost?.adminComment && (
            <div className="gc-forum-admin-comment">
              Rejection Reason: {selectedPost.adminComment}
            </div>
        )}

        <div className="gc-report-list-wrap">
          <h4 className="gc-report-list-title">Report Reasons</h4>

          {reports.length === 0 ? (
            <div className="gc-empty">
              No reports found
            </div>
          ) : (
            <div className="gc-report-card-list">
              {reports.map((r) => (
                <div className="gc-report-card" key={r.reportId}>
                  <div className="gc-report-card-top">
                    <div>
                      <b>{r.reportedByUserName}</b>
                      <div className="gc-muted">
                        ID: {r.reportedByUserId}
                      </div>
                    </div>

                    <span className="gc-report-reason">
                      {r.reason}
                    </span>
                  </div>

                  <p className="gc-report-card-remark">
                    {r.customReason || "No custom remark"}
                  </p>

                  <div className="gc-report-card-date">
                    {r.reportedAt
                      ? new Date(r.reportedAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
