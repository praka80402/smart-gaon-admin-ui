import React, { useState, useMemo } from "react";
import AsyncVideoPlayer from "../../components/AsyncVideoPlayer";
import "./prizeCeremonyVideos.css";

const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const PrizeCeremonyVideosSection = ({
  ceremonyVideos = [],
  prizeVideosLoading = false,
  handleOpenPrizeModal,
  handleEditPrizeVideo,
  handleDeletePrizeVideo,
  fetchPrizeVideos,
  competitions = [],
  categories = [],
  onAddNewCategory,
  setMsg,
}) => {
  // Filter States - initially no filter is selected
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Video Player Modal State for large fullscreen/cinema viewing
  const [activeModalVideo, setActiveModalVideo] = useState(null);

  // Helper to extract year from video object
  const getVideoYear = (v) => {
    if (v.year && String(v.year).trim()) return String(v.year).trim();
    if (v.startDate) {
      const d = new Date(v.startDate);
      if (!isNaN(d.getTime())) return d.getFullYear().toString();
    }
    if (v.createdAt) {
      const d = new Date(v.createdAt);
      if (!isNaN(d.getTime())) return d.getFullYear().toString();
    }
    return "";
  };

  // Helper to extract month from video object
  const getVideoMonth = (v) => {
    if (v.month && String(v.month).trim()) return String(v.month).trim();
    if (v.startDate) {
      const d = new Date(v.startDate);
      if (!isNaN(d.getTime())) return d.toLocaleString("en-US", { month: "long" });
    }
    if (v.createdAt) {
      const d = new Date(v.createdAt);
      if (!isNaN(d.getTime())) return d.toLocaleString("en-US", { month: "long" });
    }
    return "";
  };

  // Helper to extract resolved competition name
  const getVideoCompName = (v) => {
    if (v.resolvedCompetitionName && v.resolvedCompetitionName.trim()) {
      return v.resolvedCompetitionName.trim();
    }
    if (v.competitionName && v.competitionName.trim() && v.competitionName !== v.competitionId) {
      return v.competitionName.trim();
    }
    const matched = competitions.find(
      (c) => String(c.competitionId) === String(v.competitionId)
    );
    if (matched && matched.title) return matched.title;
    return v.competitionName || v.competitionId || "Competition";
  };

  // Unique years for the dropdown
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    // Include current and previous few years
    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 1; y >= currentYear - 4; y--) {
      yearsSet.add(String(y));
    }
    ceremonyVideos.forEach((v) => {
      const y = getVideoYear(v);
      if (y) yearsSet.add(String(y));
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [ceremonyVideos]);

  // Check if user has chosen/applied any filter
  const isFilterActive =
    (selectedYear !== "" && selectedYear !== "ALL") ||
    (selectedMonth !== "" && selectedMonth !== "ALL") ||
    (selectedCategory !== "" && selectedCategory !== "ALL") ||
    (searchQuery.trim() !== "");

  // Filtered ceremony videos
  const filteredVideos = useMemo(() => {
    if (!isFilterActive) return [];

    return ceremonyVideos.filter((v) => {
      // 1. Year Filter
      if (selectedYear !== "" && selectedYear !== "ALL") {
        const vYear = getVideoYear(v);
        if (String(vYear) !== String(selectedYear)) return false;
      }

      // 2. Month Filter
      if (selectedMonth !== "" && selectedMonth !== "ALL") {
        const vMonth = getVideoMonth(v);
        if (!vMonth || vMonth.toLowerCase() !== selectedMonth.toLowerCase()) {
          return false;
        }
      }

      // 3. Category / Competition Filter
      if (selectedCategory !== "" && selectedCategory !== "ALL") {
        const cat = (v.category || v.competitionType || "").toLowerCase();
        const compName = getVideoCompName(v).toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (!cat.includes(target) && !compName.includes(target)) {
          return false;
        }
      }

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const compName = getVideoCompName(v).toLowerCase();
        const cat = (v.category || v.competitionType || "").toLowerCase();
        const vYear = getVideoYear(v).toLowerCase();
        const vMonth = getVideoMonth(v).toLowerCase();
        if (
          !compName.includes(q) &&
          !cat.includes(q) &&
          !vYear.includes(q) &&
          !vMonth.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [ceremonyVideos, isFilterActive, selectedYear, selectedMonth, selectedCategory, searchQuery, competitions]);

  const handleYearChange = (val) => {
    setSelectedYear(val);
    setCurrentPage(1);
  };

  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
  };

  // Reset all filters to initial state
  const handleResetFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedCategory("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const totalItems = filteredVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

  return (
    <div className="admin-sc-panel-card prize-ceremony-container">
      {/* HEADER */}
      <div className="prize-ceremony-header">
        <div>
          <h3 className="prize-ceremony-title">
            🎬 Prize Ceremony Videos
          </h3>
          <p className="prize-ceremony-subtitle">
            Watch and manage official prize ceremony distribution videos. Filter by Year, Month, and Competition Name.
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="prize-ceremony-filter-bar">
        {/* Year Filter */}
        <div className="prize-ceremony-filter-item">
          <label className="prize-ceremony-filter-label">🗓️ Year</label>
          <select
            className="prize-ceremony-filter-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            <option value="">-- Choose Year --</option>
            <option value="ALL">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="prize-ceremony-filter-item">
          <label className="prize-ceremony-filter-label">📅 Month</label>
          <select
            className="prize-ceremony-filter-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            <option value="">-- Choose Month --</option>
            <option value="ALL">All Months</option>
            {MONTHS_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Competition Filter */}
        <div className="prize-ceremony-filter-item">
          <label className="prize-ceremony-filter-label">🏆 Competition</label>
          <select
            className="prize-ceremony-filter-select"
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "ADD_NEW") {
                if (typeof onAddNewCategory === "function") {
                  onAddNewCategory();
                }
              } else {
                handleCategoryChange(val);
              }
            }}
          >
            <option value="ALL">All Competitions</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="ADD_NEW">+ Add New Category</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="prize-ceremony-filter-item" style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
          <label className="prize-ceremony-filter-label">🔍 Search</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              className="prize-ceremony-search-input"
              placeholder="Search by competition or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              type="button"
              className="admin-sc-btn admin-sc-btn-primary"
              onClick={handleSearchSubmit}
              style={{ padding: "9px 18px", height: "38px", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="prize-ceremony-filter-actions">
          {isFilterActive && (
            <button
              type="button"
              className="admin-sc-btn admin-sc-btn-ghost"
              onClick={handleResetFilters}
              style={{ padding: "9px 14px", height: "38px" }}
              title="Reset all filters"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      {prizeVideosLoading ? (
        <div className="prize-ceremony-loader-card" style={{ padding: "36px 20px" }}>
          <h4 className="prize-ceremony-spinner-title" style={{ color: "#2563eb" }}>⏳ Loading Prize Ceremony Videos...</h4>
          <p className="prize-ceremony-spinner-text">Fetching official ceremony videos from database.</p>
        </div>
      ) : !isFilterActive ? (
        /* INITIAL STATE: DO NOT SHOW ANY VIDEO AT START */
        <div className="prize-ceremony-prompt-card">
          <div className="prize-ceremony-prompt-icon">🎬</div>
          <h4 className="prize-ceremony-prompt-title">
            Select a Filter to View Prize Ceremony Videos
          </h4>
          <p className="prize-ceremony-prompt-text">
            Start by selecting a <strong>Year</strong> or <strong>Month</strong> from the filters above to watch prize ceremony videos.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="admin-sc-btn admin-sc-btn-outline"
              onClick={() => handleYearChange(new Date().getFullYear().toString())}
            >
              🗓️ Current Year ({new Date().getFullYear()})
            </button>
          </div>
        </div>
      ) : filteredVideos.length === 0 ? (
        /* NO RESULTS MATCHING FILTER */
        <div className="prize-ceremony-prompt-card">
          <div className="prize-ceremony-prompt-icon">🔍</div>
          <h4 className="prize-ceremony-prompt-title">No Ceremony Videos Found</h4>
          <p className="prize-ceremony-prompt-text">
            No prize ceremony videos matched your selected filter criteria. Try adjusting or resetting your filter.
          </p>
          <button
            type="button"
            className="admin-sc-btn admin-sc-btn-ghost"
            onClick={handleResetFilters}
          >
            🔄 Reset Filters
          </button>
        </div>
      ) : (
        /* FILTERED CEREMONY VIDEOS GRID */
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
              Showing {filteredVideos.length} of {ceremonyVideos.length} Prize Ceremony Video{filteredVideos.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="prize-ceremony-grid">
            {paginatedVideos.map((video) => {
              const compName = getVideoCompName(video);
              const vYear = getVideoYear(video);
              const vMonth = getVideoMonth(video);
              const cat = video.category || video.competitionType || "Ceremony";

              return (
                <div key={video.id || video.competitionId} className="prize-ceremony-card">
                  <div className="prize-ceremony-card-top-bar" />

                  <div>
                    {/* Badges Row */}
                    <div className="prize-ceremony-badges-row">
                      <span className="prize-ceremony-badge-category">
                        🏷️ {cat}
                      </span>
                      {(vYear || vMonth) && (
                        <span className="prize-ceremony-badge-date">
                          📅 {vMonth} {vYear}
                        </span>
                      )}
                    </div>

                    {/* Competition Name Title */}
                    <h4 className="prize-ceremony-card-title">
                      🏆 {compName}
                    </h4>

                    {/* Dates if available */}
                    {(video.startDate || video.endDate) && (
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: 12 }}>
                        🗓️ {video.startDate ? new Date(video.startDate).toLocaleDateString() : ""}
                        {video.startDate && video.endDate ? " – " : ""}
                        {video.endDate ? new Date(video.endDate).toLocaleDateString() : ""}
                      </div>
                    )}

                    {/* Video Player Preview */}
                    <div className="prize-ceremony-player-wrapper">
                      <AsyncVideoPlayer videoUrl={video.videoUrl} />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="prize-ceremony-card-actions">
                    <div className="prize-ceremony-card-btns-left">
                      <button
                        type="button"
                        className="admin-sc-btn admin-sc-btn-accent"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => setActiveModalVideo({ ...video, compName, vYear, vMonth, cat })}
                      >
                        🎬 Watch Full Video
                      </button>
                      {video.videoUrl && (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-sc-btn admin-sc-btn-ghost"
                          style={{ padding: "6px 10px", fontSize: "12px", textDecoration: "none" }}
                          title="Open external link"
                        >
                          🔗 Open
                        </a>
                      )}
                    </div>

                    <div className="prize-ceremony-card-btns-right" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {handleEditPrizeVideo && (
                        <button
                          type="button"
                          className="admin-sc-btn admin-sc-btn-ghost"
                          style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                          onClick={() => handleEditPrizeVideo(video)}
                          title="Edit ceremony video"
                        >
                          ✏️ Edit / Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION BAR */}
          {totalItems > 0 && (
            <div className="prize-ceremony-pagination-bar">
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{totalItems}</strong> ceremony videos
                {totalPages > 1 && (
                  <span style={{ marginLeft: "8px", color: "#94a3b8", fontWeight: "500" }}>
                    (Page {validCurrentPage} of {totalPages})
                  </span>
                )}
              </div>

              <div className="prize-ceremony-pagination-controls">
                <button
                  type="button"
                  className="prize-ceremony-page-btn"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  title="First Page"
                >
                  «
                </button>
                <button
                  type="button"
                  className="prize-ceremony-page-btn"
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  ‹ Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 2)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>}
                        <button
                          type="button"
                          className={`prize-ceremony-page-btn ${validCurrentPage === p ? "active" : ""}`}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  className="prize-ceremony-page-btn"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  className="prize-ceremony-page-btn"
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Last Page"
                >
                  »
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="prize-ceremony-filter-select"
                  style={{ width: "75px", padding: "4px 8px", fontSize: "12px", backgroundColor: "#fff" }}
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL-SIZE VIDEO MODAL */}
      {activeModalVideo && (
        <div
          className="prize-ceremony-modal-overlay"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="prize-ceremony-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prize-ceremony-modal-header">
              <div>
                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  🎬 {activeModalVideo.compName}
                </h4>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Prize Distribution Ceremony • {activeModalVideo.vMonth} {activeModalVideo.vYear} • {activeModalVideo.cat}
                </span>
              </div>
              <button
                type="button"
                className="prize-ceremony-modal-close-btn"
                onClick={() => setActiveModalVideo(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="prize-ceremony-modal-body">
              <AsyncVideoPlayer videoUrl={activeModalVideo.videoUrl} halfScreen={true} />
            </div>

            <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Official Ceremony Video
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                {activeModalVideo.videoUrl && (
                  <a
                    href={activeModalVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-sc-btn admin-sc-btn-outline"
                    style={{ padding: "6px 14px", fontSize: "13px", textDecoration: "none" }}
                  >
                    🔗 Open in New Tab
                  </a>
                )}
                <button
                  type="button"
                  className="admin-sc-btn admin-sc-btn-accent"
                  style={{ padding: "6px 16px", fontSize: "13px" }}
                  onClick={() => setActiveModalVideo(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrizeCeremonyVideosSection;
