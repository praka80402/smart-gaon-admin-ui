import React, { useEffect, useState } from "react";
import api from "../../../services/axiosInstance";
import "./jobAdmin.css";

const BASE_URL = "/api/admin";

const JobAdmin = () => {
  const role = localStorage.getItem("adminRole");

  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // ✅ Details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  // ================= FETCH JOBS =================
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${BASE_URL}/jobs?page=${page}&size=${size}`
      );

      const jobsData = res.data.content || [];

      const jobsWithCount = await Promise.all(
        jobsData.map(async (job) => {
          try {
            const countRes = await api.get(
              `${BASE_URL}/jobs/${job.jobId}/reports/count`
            );
            return { ...job, reportCount: countRes.data };
          } catch {
            return { ...job, reportCount: 0 };
          }
        })
      );

      setJobs(jobsWithCount);
      setTotalPages(res.data.totalPages || 0);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH REPORTS =================
  const fetchReports = async (jobId) => {
    try {
      const res = await api.get(
        `${BASE_URL}/jobs/${jobId}/reports?page=0&size=10`
      );
      setReports(res.data.content || []);
      setSelectedJobId(jobId);
      setShowReportModal(true);
    } catch (error) {
      console.error("Failed to load reports", error);
    }
  };

  // ================= DELETE JOB =================
  const deleteJob = async (jobId) => {
    if (!canManage) return;
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`${BASE_URL}/jobs/${jobId}`);
      alert("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error("Failed to delete job", error);
    }
  };

  // ================= OPEN DETAIL MODAL =================
  const openDetails = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  // ================= CARD STYLE HELPERS =================
  const typeStyles = {
    "FULL_TIME": { emoji: "💼", bg: "#E6F1FB" },
    "PART_TIME": { emoji: "🕒", bg: "#FAECE7" },
    "CONTRACT": { emoji: "📄", bg: "#FBEAF0" },
    "INTERNSHIP": { emoji: "🎓", bg: "#EAF3DE" },
  };

  const getTypeStyle = (type) => {
    const key = (type || "").toUpperCase().replace(/\s+/g, "_");
    return typeStyles[key] || { emoji: "🧰", bg: "#EEEDFE" };
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB");
  };

  return (
    <div className="job-admin-container">
      <h2>Job Management</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <div className="job-list-header">
        <span>Status</span>
        <span>Job Details</span>
        <span>Timeline</span>
        <span>Description</span>
        <span>Location</span>
        <span>Salary</span>
        <span>Reports</span>
        <span>Actions</span>
      </div>

      {!loading && jobs.length === 0 && (
        <div className="job-empty">No Jobs Found</div>
      )}

      <div className="job-card-list">
        {jobs.map((job) => {
          const style = getTypeStyle(job.employmentType);
          const isOpen = job.status?.toUpperCase() === "OPEN";
          return (
            <div className="job-card" key={job.jobId}>
              <div className="job-col job-col-status">
                <span className={`status-pill ${isOpen ? "open" : "closed"}`}>
                  <span className="status-dot" />
                  {job.status || "N/A"}
                </span>
              </div>

              <div className="job-col job-col-details">
                <div className="job-icon-avatar" style={{ background: style.bg }}>
                  <span>{style.emoji}</span>
                </div>
                <div>
                  <p className="job-title">{job.title}</p>
                  <span className="job-tag">{job.employmentType || "N/A"}</span>
                </div>
              </div>

              <div className="job-col job-col-timeline">
                <span className="timeline-icon">📅</span>
                <div>
                  <div>{formatDate(job.createdAt)}</div>
                  <div className="timeline-to">to</div>
                  <div className="timeline-end">{formatDate(job.deadline)}</div>
                </div>
              </div>

              <div className="job-col job-col-desc">
                {job.description || "-"}
              </div>

              <div className="job-col job-col-location">
                <span className="location-pill">{job.location || "ALL"}</span>
              </div>

              <div className="job-col job-col-salary">
                {job.salaryRange || "—"}
              </div>

              <div className="job-col job-col-reports">
                <span className="reports-pill">
                  <span className="reports-icon">🚩</span>
                  {job.reportCount}
                </span>
              </div>

              <div className="job-col job-col-actions">
                <button className="detail-btn" onClick={() => openDetails(job)}>
                  View Details
                </button>
                <button className="view-btn" onClick={() => fetchReports(job.jobId)}>
                  Reports
                </button>
                {canManage && (
                  <button className="delete-btn" onClick={() => deleteJob(job.jobId)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* ================= JOB DETAIL MODAL ================= */}
      {showDetailModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Job Details — #{selectedJob.jobId}</h3>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Title</span>
                <span className="detail-value">{selectedJob.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{selectedJob.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employment Type</span>
                <span className="detail-value">{selectedJob.employmentType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Salary Range</span>
                <span className="detail-value">{selectedJob.salaryRange}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{selectedJob.contactNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deadline</span>
                <span className="detail-value">{selectedJob.deadline}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{selectedJob.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created At</span>
                <span className="detail-value">
                  {selectedJob.createdAt
                    ? new Date(selectedJob.createdAt).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Description</span>
                <span className="detail-value">{selectedJob.description}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Requirements</span>
                <span className="detail-value">{selectedJob.requirements}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT MODAL ================= */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reports — Job #{selectedJobId}</h3>
            <button className="close-btn" onClick={() => setShowReportModal(false)}>✕</button>

            <table className="job-table">
              <thead>
                <tr>
                  <th>Reporter Name</th>
                  <th>Reason</th>
                  <th>Custom Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>No Reports</td>
                  </tr>
                )}
                {reports.map((r, index) => (
                  <tr key={index}>
                    <td>{r.reporterName || "Unknown"}</td>
                    <td>{r.reason}</td>
                    <td>{r.customReason || "-"}</td>
                    <td>{new Date(r.reportedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAdmin;