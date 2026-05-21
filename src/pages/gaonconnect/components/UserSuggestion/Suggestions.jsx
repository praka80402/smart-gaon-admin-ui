import React, { useEffect, useState } from "react";
import "./suggestion.css";
import { api } from "../../services/apiConfig";

export default function AdminSuggestions() {
  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [suggestions, setSuggestions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6; // FIX: 6 so 3-col grid stays even (2 full rows)

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Reset to page 1 whenever suggestions list changes
  useEffect(() => {
    setPage(1);
  }, [suggestions.length]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get(`/api/admin/suggestions`);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load suggestions");
    }
  };

  const updateStatus = async (id, status) => {
    if (!canManage) {
      alert("You are not authorized to update status.");
      return;
    }
    try {
      await api.put(`/api/admin/suggestions/${id}/status`, { status });
      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteSuggestion = async (id) => {
    if (!canManage) {
      alert("You are not authorized to delete.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
    try {
      await api.delete(`/api/admin/suggestions/${id}`);
      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDescription = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // FIX: normalize status to lowercase for CSS class matching
  const statusClass = (status) => status?.toLowerCase().replace("_", "_");

  const totalPages = Math.ceil(suggestions.length / pageSize);
  const paginatedSuggestions = suggestions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="suggestion-page">
      <div className="suggestion-container">

        {/* ===== HEADER ===== */}
        <div className="suggestion-header">
          <div>
            <h1>User Suggestions</h1>
            <p>Manage citizen suggestions & feedback reports</p>
          </div>

          <div className="suggestion-stats">
            <div className="suggestion-stat-card">
              <h3>{suggestions.length}</h3>
              <span>Total Suggestions</span>
            </div>
            <div className="suggestion-stat-card new">
              <h3>{suggestions.filter((s) => s.status === "NEW").length}</h3>
              <span>New</span>
            </div>
            <div className="suggestion-stat-card completed">
              <h3>{suggestions.filter((s) => s.status === "COMPLETED").length}</h3>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* ===== GRID ===== */}
        <div className="suggestion-grid">

          {/* FIX: Empty state when no suggestions */}
          {paginatedSuggestions.length === 0 ? (
            <div className="suggestion-empty">
              <div className="suggestion-empty-icon">📭</div>
              <h3>No Suggestions Yet</h3>
              <p>When citizens submit suggestions, they'll appear here.</p>
            </div>
          ) : (
            paginatedSuggestions.map((item) => {
              const isExpanded = expandedId === item.id;
              // FIX: proper CSS class for status (in_progress, new, etc.)
              const cls = item.status?.toLowerCase().replace("_", "_") ?? "new";

              return (
                <div className="suggestion-card-wrapper" key={item.id}>
                <div className="suggestion-card">

                  {/* TOP */}
                  <div className="suggestion-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="suggestion-id">Suggestion #{item.id}</div>
                      {/* FIX: h3 has word-break in CSS so long titles wrap */}
                      <h3>{item.title}</h3>
                    </div>

                    {/* FIX: fixed-width dropdown with consistent styling */}
                    <select
                      className={`suggestion-status ${cls}`}
                      value={item.status}
                      disabled={!canManage}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="suggestion-desc">
                    <p className={isExpanded ? "suggestion-desc-full" : "suggestion-desc-short"}>
                      {item.description}
                    </p>
                    {item.description?.length > 80 && (
                      <button
                        className="suggestion-view-btn"
                        onClick={() => toggleDescription(item.id)}
                      >
                        {isExpanded ? "View Less ↑" : "View More ↓"}
                      </button>
                    )}
                  </div>

                  {/* DETAILS — FIX: inside a pill background box */}
                  <div className="suggestion-details">
                    <span>📞 {item.phone}</span>
                    <span>📍 {item.pincode}</span>
                  </div>

                  {/* ACTION */}
                  {canManage && (
                    <div className="suggestion-actions">
                      <button
                        className="suggestion-delete-btn"
                        onClick={() => deleteSuggestion(item.id)}
                      >
                        Delete
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
          <div className="suggestion-pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ← Prev
            </button>

            <div className="suggestion-pages">
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
    </div>
  );
}
