import React, { useEffect, useState } from "react";
import "./problem.css";
import { api } from "../../services/apiConfig";

export default function AdminProblems() {

  const role = localStorage.getItem("adminRole");

  const canManage =
    role === "SUPER_ADMIN" ||
    role === "STATE_ADMIN";

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const pageSize = 6;

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [problems]);

  const fetchProblems = async () => {
    try {
      const res = await api.get(`/api/admin/problems`);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!canManage) {
      alert("You are not authorized to update status.");
      return;
    }
    try {
      await api.put(`/api/admin/problems/${id}/status`, { status });
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteProblem = async (id) => {
    if (!canManage) {
      alert("You are not authorized to delete.");
      return;
    }
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.delete(`/api/admin/problems/${id}`);
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDesc = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openImagePreview = (images, index) => {
    setPreviewImages(images);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  const totalPages = Math.ceil(problems.length / pageSize);
  const paginatedProblems = problems.slice((page - 1) * pageSize, page * pageSize);

  // Single spinner only — no text
  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="modern-loader"></div>
      </div>
    );
  }

  return (
    <div className="problem-page">
      <div className="problem-container-box">

        {/* ===== HEADER ===== */}
        <div className="problem-header">
          <div>
            <h1>Problem Reports</h1>
            <p>Manage village issues & citizen reports</p>
          </div>

          <div className="problem-stats">
            <div className="stat-card">
              <h3>{problems.length}</h3>
              <span>Total Reports</span>
            </div>
            <div className="stat-card pending">
              <h3>{problems.filter((p) => p.status === "Submitted").length}</h3>
              <span>Pending</span>
            </div>
            <div className="stat-card resolved">
              <h3>{problems.filter((p) => p.status === "Resolved").length}</h3>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="problem-grid">

          {paginatedProblems.length === 0 ? (
            <div className="problem-empty">
              <div className="problem-empty-icon">📭</div>
              <h3>No Reports Yet</h3>
              <p>When citizens submit problem reports, they'll appear here.</p>
            </div>
          ) : (
            paginatedProblems.map((item) => {
              const expanded = expandedId === item.reportId;
              const statusCls = item.status.replace(/\s/g, "").toLowerCase();

              return (
                <div className="problem-card-wrapper" key={item.reportId}>
                  <div className="problem-card">

                    {/* TOP */}
                    <div className="problem-card-top">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="problem-id">Report #{item.reportId}</div>
                        <h3>{item.title}</h3>
                        <span className="problem-category">{item.category}</span>
                      </div>

                      <select
                        value={item.status}
                        disabled={!canManage}
                        onChange={(e) => updateStatus(item.reportId, e.target.value)}
                        className={`status-pill ${statusCls}`}
                      >
                        <option>Submitted</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="problem-desc">
                      <p className={expanded ? "desc-full" : "desc-short"}>
                        {item.description}
                      </p>
                      <button
                        className="view-btn"
                        onClick={() => toggleDesc(item.reportId)}
                      >
                        {expanded ? "View Less ↑" : "View More ↓"}
                      </button>
                    </div>

                    {/* LOCATION */}
                    <div className="problem-location">
                      📍 {item.location}
                    </div>

                    {/* MEDIA */}
                    {item.mediaAttachments?.length > 0 && (
                      <div className="problem-media">
                        {item.mediaAttachments.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            onClick={() => openImagePreview(item.mediaAttachments, i)}
                          />
                        ))}
                      </div>
                    )}

                    {/* ACTION */}
                    {canManage && (
                      <div className="problem-actions">
                        <button
                          className="delete-btn"
                          onClick={() => deleteProblem(item.reportId)}
                        >
                          Delete Report
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="pagination-box">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ← Prev
            </button>
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={page === index + 1 ? "active-page" : ""}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next →
            </button>
          </div>
        )}

      </div>

      {/* ===== IMAGE MODAL ===== */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <button
            className="close-btn"
            onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
          >
            ✕
          </button>
          <button
            className="nav-btn left"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            ❮
          </button>
          <img
            src={previewImages[currentImageIndex]}
            alt=""
            className="modal-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="nav-btn right"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            ❯
          </button>
        </div>
      )}

    </div>
  );
}
