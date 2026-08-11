import React, { useEffect, useMemo, useState } from "react";
import {
  getSchoolCompetitionSubmissions,
  rejectCompetitionSubmission, // (submissionId, reason) => Promise<updatedSubmission>
} from "../userService";
import "./SchoolAdminEntries.css";

const PAGE_SIZE = 10;

const emptyFilters = {
  name: "",
  roll: "",
  competition: "", // matches competition name
  group: "",
};

const SchoolAdminEntries = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);

  const [videoModal, setVideoModal] = useState(null); // holds the submission being previewed
  const [rejectTarget, setRejectTarget] = useState(null); // holds the submission pending rejection
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const school = localStorage.getItem("adminSchool") || "";

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSchoolCompetitionSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = "/login";
  };

  // ---- Filtering ----
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const filteredSubmissions = useMemo(() => {
    const name = filters.name.trim().toLowerCase();
    const roll = filters.roll.trim().toLowerCase();
    const competition = filters.competition.trim().toLowerCase();
    const group = filters.group.trim().toLowerCase();

    return submissions.filter((s) => {
      if (name && !String(s.studentName || "").toLowerCase().includes(name)) {
        return false;
      }
      if (roll && !String(s.rollNumber || "").toLowerCase().includes(roll)) {
        return false;
      }
      if (
        competition &&
        !String(s.competitionName || "").toLowerCase().includes(competition)
      ) {
        return false;
      }
      if (group && !String(s.groupCategory || "").toLowerCase().includes(group)) {
        return false;
      }
      return true;
    });
  }, [submissions, filters]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedSubmissions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSubmissions.slice(start, start + PAGE_SIZE);
  }, [filteredSubmissions, page]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pageNumbers = useMemo(() => {
    // Show up to 5 page buttons centered on current page
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  // ---- Reject ----
  const openRejectModal = (submission) => {
    setRejectTarget(submission);
    setRejectReason("");
  };
  const cancelReject = () => {
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setError("Please enter a reason for rejecting this entry.");
      return;
    }
    const id = rejectTarget.submissionId;
    setRejectingId(id);
    setError("");
    try {
      const updated = await rejectCompetitionSubmission(id, rejectReason.trim());
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === id ? { ...s, ...updated } : s))
      );
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      setError("Couldn't reject this entry. Please try again.");
    } finally {
      setRejectingId(null);
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v.trim() !== "");

  return (
    <div className="sa-page">
      <nav className="sa-navbar">
        <span className="sa-navbar-brand">School Admin Portal</span>
      </nav>
      <div className="sa-container">
      <div className="sa-card">
        <div className="sa-header">
          <div className="sa-header-title">
            <h2>School Competition Entries</h2>
            <p className="sa-subtitle">{school || "No school assigned"}</p>
          </div>
          <button className="sa-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Filters */}
        <div className="sa-filters">
          <div className="sa-filter-field">
            <label htmlFor="f-name">Student name</label>
            <input
              id="f-name"
              type="text"
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />
          </div>
          <div className="sa-filter-field">
            <label htmlFor="f-roll">Roll no.</label>
            <input
              id="f-roll"
              type="text"
              placeholder="Search by roll no."
              value={filters.roll}
              onChange={(e) => handleFilterChange("roll", e.target.value)}
            />
          </div>
          <div className="sa-filter-field">
            <label htmlFor="f-competition">Competition name</label>
            <input
              id="f-competition"
              type="text"
              placeholder="Search by competition name"
              value={filters.competition}
              onChange={(e) => handleFilterChange("competition", e.target.value)}
            />
          </div>
          <div className="sa-filter-field">
            <label htmlFor="f-group">Group</label>
            <input
              id="f-group"
              type="text"
              placeholder="Search by group"
              value={filters.group}
              onChange={(e) => handleFilterChange("group", e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <button className="sa-clear-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {error && <p className="sa-error">{error}</p>}

        {loading ? (
          <p className="sa-empty">Loading entries...</p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="sa-empty">
            {hasActiveFilters
              ? "No entries match your filters."
              : "No entries found for your school."}
          </p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Submission ID</th>
                    <th>Competition</th>
                    <th>Student Name</th>
                    <th>Class &amp; Roll</th>
                    <th>Group</th>
                    <th>Entry Title</th>
                    <th>Submitted By</th>
                    <th>Status</th>
                    <th>Video</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubmissions.map((s) => (
                    <tr key={s.submissionId}>
                      <td>{s.submissionId}</td>
                      <td>{s.competitionName || s.competitionId}</td>
                      <td>{s.studentName}</td>
                      <td>
                        {s.classGrade} (Roll: {s.rollNumber})
                      </td>
                      <td>{s.groupCategory || "-"}</td>
                      <td>{s.entryTitle}</td>
                      <td>{s.submittedBy || "-"}</td>
                      <td>
                        <span className={`sa-status sa-status-${(s.status || "submitted").toLowerCase()}`}>
                          {s.status || "SUBMITTED"}
                        </span>
                        {s.status === "REJECTED" && s.rejectionReason && (
                          <div className="sa-reject-reason">
                            {s.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        {s.videoUrl ? (
                          <button
                            className="sa-video-btn"
                            onClick={() => setVideoModal(s)}
                          >
                            View
                          </button>
                        ) : (
                          <span className="sa-muted">No video</span>
                        )}
                      </td>
                      <td>
                        {s.status === "REJECTED" ? (
                          <span className="sa-muted">Rejected</span>
                        ) : (
                          <button
                            className="sa-reject-btn"
                            onClick={() => openRejectModal(s)}
                            disabled={rejectingId === s.submissionId}
                          >
                            {rejectingId === s.submissionId ? "Rejecting..." : "Reject"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="sa-pagination">
              <span className="sa-pagination-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredSubmissions.length)} of{" "}
                {filteredSubmissions.length}
              </span>
              <div className="sa-pagination-controls">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                  Prev
                </button>
                {pageNumbers[0] > 1 && (
                  <>
                    <button onClick={() => goToPage(1)}>1</button>
                    {pageNumbers[0] > 2 && <span className="sa-page-ellipsis">…</span>}
                  </>
                )}
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={n === page ? "sa-page-active" : ""}
                    onClick={() => goToPage(n)}
                  >
                    {n}
                  </button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                      <span className="sa-page-ellipsis">…</span>
                    )}
                    <button onClick={() => goToPage(totalPages)}>{totalPages}</button>
                  </>
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video modal */}
      {videoModal && (
        <div className="sa-modal-overlay" onClick={() => setVideoModal(null)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>{videoModal.entryTitle || "Submission video"}</h3>
              <button className="sa-modal-close" onClick={() => setVideoModal(null)}>
                &times;
              </button>
            </div>
            <video controls src={videoModal.videoUrl} className="sa-modal-video">
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}

      {/* Reject confirmation modal */}
      {rejectTarget && (
        <div className="sa-modal-overlay" onClick={cancelReject}>
          <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>Reject entry</h3>
              <button className="sa-modal-close" onClick={cancelReject}>
                &times;
              </button>
            </div>
            <p>
              Rejecting the entry for <strong>{rejectTarget.studentName}</strong>{" "}
              ({rejectTarget.entryTitle}). Please give a reason — this will be
              recorded and shown to the student.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                className="sa-reject-textarea"
                rows={4}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid video link, off-topic content, duplicate entry..."
              />
              <div className="sa-modal-actions">
                <button type="button" className="sa-modal-cancel" onClick={cancelReject}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sa-modal-confirm-delete"
                  disabled={rejectingId === rejectTarget.submissionId}
                >
                  {rejectingId === rejectTarget.submissionId
                    ? "Rejecting..."
                    : "Confirm rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SchoolAdminEntries;
