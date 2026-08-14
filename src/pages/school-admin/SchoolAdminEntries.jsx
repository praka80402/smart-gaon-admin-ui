import React, { useEffect, useMemo, useState } from "react";
import {
  getSchoolCompetitionSubmissions,
  deleteCompetitionSubmission, // (submissionId) => Promise<void>
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
  const [deleteTarget, setDeleteTarget] = useState(null); // holds the submission pending deletion
  const [deletingId, setDeletingId] = useState(null);

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

  // ---- Delete ----
  const confirmDelete = (submission) => setDeleteTarget(submission);
  const cancelDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.submissionId;
    setDeletingId(id);
    setError("");
    try {
      await deleteCompetitionSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.submissionId !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this entry. Please try again.");
    } finally {
      setDeletingId(null);
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
                    {/* <th>Actions</th> */}
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
                      {/* <td>
                        <button
                          className="sa-delete-btn"
                          onClick={() => confirmDelete(s)}
                          disabled={deletingId === s.submissionId}
                        >
                          {deletingId === s.submissionId ? "Deleting..." : "Delete"}
                        </button>
                      </td> */}
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="sa-modal-overlay" onClick={cancelDelete}>
          <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3>Delete entry?</h3>
              <button className="sa-modal-close" onClick={cancelDelete}>
                &times;
              </button>
            </div>
            <p>
              This will permanently delete the entry for{" "}
              <strong>{deleteTarget.studentName}</strong> (
              {deleteTarget.entryTitle}). They'll be able to submit a new
              entry for this competition after this is deleted.
            </p>
            <div className="sa-modal-actions">
              <button type="button" className="sa-modal-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button
                type="button"
                className="sa-modal-confirm-delete"
                onClick={handleDelete}
                disabled={deletingId === deleteTarget.submissionId}
              >
                {deletingId === deleteTarget.submissionId ? "Deleting..." : "Delete entry"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SchoolAdminEntries;
