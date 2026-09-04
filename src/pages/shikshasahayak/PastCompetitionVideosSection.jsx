import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import AsyncVideoPlayer from "../../components/AsyncVideoPlayer";
import "./pastCompetitionVideos.css";

const PastCompetitionVideosSection = ({
  allAdminUploadedVideos = [],
  categories = [],
  prizeVideosLoading = false,
  handleOpenPastPrizeModal,
  handleEditCompetitionGroup,
  fetchPrizeVideos,
  fetchSubmissions,
  setMsg,
}) => {
  const [adminVideoYearFilter, setAdminVideoYearFilter] = useState("ALL");
  const [adminVideoMonthFilter, setAdminVideoMonthFilter] = useState("ALL");
  const [adminVideoCategoryFilter, setAdminVideoCategoryFilter] = useState("ALL");
  const [adminVideoGroupFilter, setAdminVideoGroupFilter] = useState("ALL");

  const [appliedYearFilter, setAppliedYearFilter] = useState("ALL");
  const [appliedMonthFilter, setAppliedMonthFilter] = useState("ALL");
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState("ALL");
  const [appliedGroupFilter, setAppliedGroupFilter] = useState("ALL");

  const [selectedCompetitionModal, setSelectedCompetitionModal] = useState(null);
  const [modalGroupFilter, setModalGroupFilter] = useState("ALL");
  const [editingWinnerItem, setEditingWinnerItem] = useState(null);

  const handleSearch4thTabVideos = () => {
    setAppliedYearFilter(adminVideoYearFilter);
    setAppliedMonthFilter(adminVideoMonthFilter);
    setAppliedCategoryFilter(adminVideoCategoryFilter);
    setAppliedGroupFilter(adminVideoGroupFilter);
  };

  const handleReset4thTabVideos = () => {
    setAdminVideoYearFilter("ALL");
    setAdminVideoMonthFilter("ALL");
    setAdminVideoCategoryFilter("ALL");
    setAdminVideoGroupFilter("ALL");
    setAppliedYearFilter("ALL");
    setAppliedMonthFilter("ALL");
    setAppliedCategoryFilter("ALL");
    setAppliedGroupFilter("ALL");
  };

  const handleSaveEditedIndividualWinner = async (e) => {
    e.preventDefault();
    if (!editingWinnerItem) return;

    try {
      const isSub = editingWinnerItem.isAnnouncedWinner || (editingWinnerItem.id && (String(editingWinnerItem.id).startsWith("sub-") || String(editingWinnerItem.id).startsWith("winner-sub-")));

      if (!isSub && editingWinnerItem.id) {
        const cleanId = String(editingWinnerItem.id).replace(/^(prize-video-|video-)/, "");
        const payload = {
          competitionName: editingWinnerItem.competitionName,
          category: editingWinnerItem.category,
          competitionType: editingWinnerItem.category,
          groupCategory: editingWinnerItem.groupCategory,
          winnerRank: parseInt(editingWinnerItem.winnerRank, 10),
          prizeAmount: editingWinnerItem.prizeAmount,
          studentName: editingWinnerItem.studentName || "",
          schoolName: editingWinnerItem.schoolName || "",
          studentClass: editingWinnerItem.studentClass || "",
          rollNumber: editingWinnerItem.rollNumber || "",
          videoUrl: editingWinnerItem.videoUrl,
          year: editingWinnerItem.year,
          month: editingWinnerItem.month,
          isPastCompetition: true,
        };
        await axiosInstance.put(
          `/admin/school-competitions/prize-videos/${cleanId}`,
          payload
        );
      } else if (editingWinnerItem.id) {
        const subId = String(editingWinnerItem.id).replace(/^(sub-|winner-sub-)/, "");
        await axiosInstance.put(
          `/admin/school-competitions/submissions/${subId}`,
          {
            studentName: editingWinnerItem.studentName || "",
            schoolName: editingWinnerItem.schoolName || "",
            studentClass: editingWinnerItem.studentClass || "",
            classGrade: editingWinnerItem.studentClass || "",
            rollNumber: editingWinnerItem.rollNumber || "",
            winnerRank: parseInt(editingWinnerItem.winnerRank, 10),
            groupCategory: editingWinnerItem.groupCategory
          }
        );
      }

      // 1. Immediately update selectedCompetitionModal state so open modal updates on screen instantly
      if (selectedCompetitionModal && editingWinnerItem) {
        setSelectedCompetitionModal((prevModal) => {
          if (!prevModal) return null;
          const updatedVideos = prevModal.videos.map((v) =>
            v.id === editingWinnerItem.id ? { ...v, ...editingWinnerItem } : v
          );
          return { ...prevModal, videos: updatedVideos };
        });
      }

      // 2. Auto-close Edit Winner Modal
      setEditingWinnerItem(null);

      // 3. Set global notification message & alert
      if (setMsg) setMsg("✓ Winner entry updated successfully!");
      alert("✓ Winner entry updated successfully!");

      // 4. Refresh prize videos from server
      await fetchPrizeVideos();
      if (fetchSubmissions) await fetchSubmissions();
    } catch (err) {
      console.error("Failed to update individual winner", err);
      alert("Failed to update winner entry.");
    }
  };

  const activeYr =
    appliedYearFilter !== "ALL" ? appliedYearFilter : adminVideoYearFilter;
  const activeMo =
    appliedMonthFilter !== "ALL" ? appliedMonthFilter : adminVideoMonthFilter;
  const activeCat =
    appliedCategoryFilter !== "ALL"
      ? appliedCategoryFilter
      : adminVideoCategoryFilter;
  const activeGrp =
    appliedGroupFilter !== "ALL"
      ? appliedGroupFilter
      : adminVideoGroupFilter;

  const filteredList = allAdminUploadedVideos.filter((v) => {
    if (activeYr !== "ALL") {
      const vYr =
        v.year || (v.startDate ? new Date(v.startDate).getFullYear().toString() : "");
      if (!vYr || String(vYr) !== String(activeYr)) return false;
    }
    if (activeMo !== "ALL") {
      if (!v.month || v.month.toLowerCase() !== activeMo.toLowerCase()) return false;
    }
    if (activeCat !== "ALL") {
      const vCat = v.category || v.competitionType || "";
      if (!vCat.toLowerCase().includes(activeCat.toLowerCase())) return false;
    }
    if (activeGrp !== "ALL") {
      const vGrp = v.groupCategory || "";
      if (!vGrp.toLowerCase().includes(activeGrp.toLowerCase())) return false;
    }
    return true;
  });

  const compMap = {};
  filteredList.forEach((v) => {
    const compKey = v.competitionId || v.competitionName;
    if (!compMap[compKey]) {
      compMap[compKey] = {
        competitionId: v.competitionId,
        competitionName: v.competitionName,
        category: v.category || v.competitionType || "School Competition",
        year: v.year,
        month: v.month,
        videos: [],
      };
    }
    compMap[compKey].videos.push(v);
  });
  const groupedComps = Object.values(compMap);

  return (
    <div className="admin-sc-panel-card past-videos-container">
      <div className="past-videos-header">
        <div>
          <h3 className="past-videos-title">
            🎬 All Past Uploaded Competition Videos
          </h3>
          <p className="past-videos-subtitle">
            Browse, filter by Year, Month, Competition Type &amp; Group, and manage all past competition videos.
          </p>
        </div>
        <button
          className="admin-sc-btn admin-sc-btn-accent"
          onClick={handleOpenPastPrizeModal}
        >
          📜 + Add Past Competition Video
        </button>
      </div>

      {/* FILTER BAR FOR 4TH TAB WITH SEARCH & RESET BUTTONS */}
      <div className="past-videos-filter-bar">
        <div>
          <label className="admin-sc-field-label">Year</label>
          <select
            className="admin-sc-filter-select past-videos-filter-select"
            value={adminVideoYearFilter}
            onChange={(e) => setAdminVideoYearFilter(e.target.value)}
          >
            <option value="ALL">All Years</option>
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-sc-field-label">Month</label>
          <select
            className="admin-sc-filter-select past-videos-filter-select"
            value={adminVideoMonthFilter}
            onChange={(e) => setAdminVideoMonthFilter(e.target.value)}
          >
            <option value="ALL">All Months</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-sc-field-label">Competition Type / Category</label>
          <select
            className="admin-sc-filter-select"
            value={adminVideoCategoryFilter}
            onChange={(e) => setAdminVideoCategoryFilter(e.target.value)}
            style={{ width: "170px", backgroundColor: "#fff" }}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="admin-sc-field-label">Group Category</label>
          <select
            className="admin-sc-filter-select"
            value={adminVideoGroupFilter}
            onChange={(e) => setAdminVideoGroupFilter(e.target.value)}
            style={{ width: "170px", backgroundColor: "#fff" }}
          >
            <option value="ALL">All Groups &amp; Consolation</option>
            <option value="Group A">Group A (Class 1-2)</option>
            <option value="Group B">Group B (Class 3-5)</option>
            <option value="Group C">Group C (Class 6-8)</option>
            <option value="Group D">Group D (Class 9-12)</option>
            <option value="Consolation">🎁 Consolation Prize</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="admin-sc-btn admin-sc-btn-primary"
            onClick={handleSearch4thTabVideos}
            style={{ padding: "9px 18px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            🔍 Search Videos
          </button>
          <button
            type="button"
            className="admin-sc-btn admin-sc-btn-ghost"
            onClick={handleReset4thTabVideos}
            style={{ padding: "9px 14px" }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* VIDEOS LIST / TABLE */}
      {prizeVideosLoading ? (
        <p className="admin-sc-empty-note">Loading past competition videos...</p>
      ) : filteredList.length === 0 ? (
        <p className="admin-sc-empty-note" style={{ padding: "30px 0" }}>
          No past videos match the selected filters.
        </p>
      ) : (
        <div>
          <div className="past-videos-grid">
            {groupedComps.map((comp) => {
              const totalWinners = comp.videos.length;
              const groupCategories = Array.from(
                new Set(comp.videos.map((v) => v.groupCategory).filter(Boolean))
              );

              return (
                <div
                  key={comp.competitionId || comp.competitionName}
                  className="past-video-card"
                  onClick={() => {
                    setModalGroupFilter("ALL");
                    setSelectedCompetitionModal(comp);
                  }}
                >
                  <div className="past-video-card-top-bar" />

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span className="past-video-card-badge">
                        🏷️ {comp.category}
                      </span>
                      <span className="past-video-card-date">
                        📅 {comp.year || ""} {comp.month ? `(${comp.month})` : ""}
                      </span>
                    </div>

                    <h3 className="past-video-card-title">
                      🏆 {comp.competitionName}
                    </h3>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                      {groupCategories.map((g) => (
                        <span key={g} className="past-video-group-chip">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalGroupFilter("ALL");
                        setSelectedCompetitionModal(comp);
                      }}
                      style={{ flex: 1, padding: "7px 10px", fontSize: "12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                    >
                      👁️ View Winners ({totalWinners})
                    </button>
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCompetitionGroup(comp);
                      }}
                      style={{ padding: "7px 10px", fontSize: "12px", borderRadius: "8px" }}
                      title="Edit Competition Entry & Batch Winners"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GROUP-WISE WINNERS MODAL */}
          {selectedCompetitionModal && (
            <div className="admin-sc-modal-overlay" style={{ zIndex: 3000 }}>
              <div className="admin-sc-modal hide-scrollbar" style={{ maxWidth: "920px", width: "95%", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px", padding: "28px" }}>
                {/* STICKY HEADER */}
                <div style={{
                  position: "sticky",
                  top: "-28px",
                  zIndex: 100,
                  backgroundColor: "#ffffff",
                  paddingTop: "20px",
                  paddingBottom: "16px",
                  marginBottom: "22px",
                  borderBottom: "2px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginLeft: "-28px",
                  marginRight: "-28px",
                  paddingLeft: "28px",
                  paddingRight: "28px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)"
                }}>
                  <div>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                      {selectedCompetitionModal.category}
                    </span>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "8px 0 4px 0", color: "#0f172a" }}>
                      🎬 {selectedCompetitionModal.competitionName}
                    </h2>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      📅 {selectedCompetitionModal.year || ""} {selectedCompetitionModal.month ? `(${selectedCompetitionModal.month})` : ""} • {selectedCompetitionModal.videos.length} Total Winners
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCompetitionModal(null)}
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "38px",
                      height: "38px",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 10px rgba(239, 68, 68, 0.3)",
                      flexShrink: 0,
                      marginLeft: "16px"
                    }}
                    title="Close Modal"
                  >
                    ✕
                  </button>
                </div>

                {/* GROUP FILTER CHIPS INSIDE MODAL */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "20px", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginRight: "4px" }}>
                    📁 Filter by Group:
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalGroupFilter("ALL")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: modalGroupFilter === "ALL" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                      background: modalGroupFilter === "ALL" ? "#2563eb" : "#ffffff",
                      color: modalGroupFilter === "ALL" ? "#ffffff" : "#334155",
                    }}
                  >
                    All Groups ({selectedCompetitionModal.videos.length})
                  </button>
                  {[
                    { id: "Group A", name: "Group A (Class 1-2)" },
                    { id: "Group B", name: "Group B (Class 3-5)" },
                    { id: "Group C", name: "Group C (Class 6-8)" },
                    { id: "Group D", name: "Group D (Class 9-12)" },
                    { id: "Consolation", name: "🎁 Consolation" },
                  ].map((grp) => {
                    const count = selectedCompetitionModal.videos.filter((v) => {
                      const cat = v.groupCategory || "";
                      return cat.toLowerCase().includes(grp.id.toLowerCase());
                    }).length;
                    if (count === 0) return null;
                    const isSel = modalGroupFilter === grp.id;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setModalGroupFilter(isSel ? "ALL" : grp.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          border: isSel ? "2px solid #2563eb" : "1px solid #cbd5e1",
                          background: isSel ? "#2563eb" : "#ffffff",
                          color: isSel ? "#ffffff" : "#334155",
                        }}
                      >
                        {grp.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Group-Wise Winner Sections */}
                {[
                  { id: "Group A", name: "Group A (Class 1-2)", color: "#2563eb", bg: "#eff6ff" },
                  { id: "Group B", name: "Group B (Class 3-5)", color: "#0d9488", bg: "#ccfbf1" },
                  { id: "Group C", name: "Group C (Class 6-8)", color: "#4f46e5", bg: "#e0e7ff" },
                  { id: "Group D", name: "Group D (Class 9-12)", color: "#7c3aed", bg: "#f3e8ff" },
                  { id: "Consolation", name: "🎁 Consolation Prize Winners", color: "#d97706", bg: "#fef3c7" },
                ].filter((grp) => modalGroupFilter === "ALL" || modalGroupFilter === grp.id).map((grp) => {
                  const groupVideos = selectedCompetitionModal.videos.filter((v) => {
                    const cat = v.groupCategory || "";
                    return cat.toLowerCase().includes(grp.id.toLowerCase());
                  });

                  if (groupVideos.length === 0) return null;

                  return (
                    <div key={grp.id} style={{ marginBottom: "24px", background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: grp.color, display: "flex", alignItems: "center", gap: "8px" }}>
                          🏷️ {grp.name}
                        </h3>
                        <span style={{ fontSize: "12px", background: grp.bg, color: grp.color, padding: "3px 10px", borderRadius: "12px", fontWeight: "700" }}>
                          {groupVideos.length} Winners
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                        {groupVideos.sort((a, b) => a.winnerRank - b.winnerRank).map((v) => (
                          <div key={v.id} style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ fontWeight: "700", fontSize: "13px", color: v.winnerRank === 1 ? "#b45309" : v.winnerRank === 2 ? "#475569" : "#c2410c" }}>
                                {v.winnerRank === 1 ? "🥇 Rank 1 Winner" : v.winnerRank === 2 ? "🥈 Rank 2 Runner-up" : v.winnerRank === 3 ? "🥉 Rank 3 Runner-up" : `Rank ${v.winnerRank}`}
                              </span>
                              <span style={{ fontWeight: "700", fontSize: "13px", color: "#059669" }}>
                                {v.prizeAmount ? (v.prizeAmount.startsWith("₹") ? v.prizeAmount : `₹ ${v.prizeAmount}`) : "—"}
                              </span>
                            </div>

                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
                              👤 {v.studentName ? v.studentName : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No Student Name</span>}
                            </div>
                            <div style={{ fontSize: "12px", color: "#475569", marginBottom: "6px" }}>
                              🏫 {v.schoolName ? v.schoolName : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No School Name</span>}
                              {v.studentClass ? ` • Class: ${v.studentClass}` : ""}
                              {v.rollNumber ? ` • Roll: ${v.rollNumber}` : ""}
                            </div>

                            {v.videoUrl ? (
                              <div style={{ marginTop: "8px" }}>
                                <AsyncVideoPlayer videoUrl={v.videoUrl} />
                              </div>
                            ) : (
                              <div style={{ background: "#f1f5f9", padding: "10px", textAlign: "center", borderRadius: "8px", fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                                No Video File Attached
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "6px", marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "10px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-warning"
                                onClick={() => setEditingWinnerItem({ ...v })}
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                ✏️ Edit Winner
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EDIT INDIVIDUAL WINNER MODAL */}
          {editingWinnerItem && (
            <div className="admin-sc-modal-overlay" style={{ zIndex: 4000 }}>
              <div className="admin-sc-modal" style={{ maxWidth: "520px", width: "90%", borderRadius: "18px", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                    ✏️ Edit Winner Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingWinnerItem(null)}
                    style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEditedIndividualWinner}>
                  <div className="admin-sc-field-group">
                    <label className="admin-sc-field-label">Competition Name</label>
                    <input
                      type="text"
                      className="admin-sc-input"
                      value={editingWinnerItem.competitionName || ""}
                      onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, competitionName: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Group Category</label>
                      {(() => {
                        const isKojoWinner = Boolean(
                          (editingWinnerItem.competitionType && editingWinnerItem.competitionType.toLowerCase().includes("kojo")) ||
                          (editingWinnerItem.competitionName && editingWinnerItem.competitionName.toLowerCase().includes("kojo")) ||
                          (editingWinnerItem.category && editingWinnerItem.category.toLowerCase().includes("kojo"))
                        );
                        return (
                          <>
                            <select
                              className="admin-sc-filter-select"
                              value={isKojoWinner ? "Group C (Class 6-8)" : (editingWinnerItem.groupCategory || "Group A (Class 1-2)")}
                              onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, groupCategory: e.target.value })}
                              style={{ width: "100%", backgroundColor: "#fff" }}
                            >
                              {isKojoWinner ? (
                                <option value="Group C (Class 6-8)">Group C (Class 6-8)</option>
                              ) : (
                                <>
                                  <option value="Group A (Class 1-2)">Group A (Class 1-2)</option>
                                  <option value="Group B (Class 3-5)">Group B (Class 3-5)</option>
                                  <option value="Group C (Class 6-8)">Group C (Class 6-8)</option>
                                  <option value="Group D (Class 9-12)">Group D (Class 9-12)</option>
                                  <option value="Consolation Prize">🎁 Consolation Prize</option>
                                </>
                              )}
                            </select>
                            {isKojoWinner && (
                              <span style={{ fontSize: "11px", color: "#2563eb", marginTop: "4px", display: "block", fontWeight: "600" }}>
                                ℹ️ Kojo Competition: Only Group C participates (Group A, B, D restricted).
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Winner Rank</label>
                      <select
                        className="admin-sc-filter-select"
                        value={String(editingWinnerItem.winnerRank || 1)}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, winnerRank: parseInt(e.target.value, 10) })}
                        style={{ width: "100%", backgroundColor: "#fff" }}
                      >
                        <option value="1">🥇 1st Rank (Winner)</option>
                        <option value="2">🥈 2nd Rank (Runner-up)</option>
                        <option value="3">🥉 3rd Rank (Runner-up)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Student Name</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={editingWinnerItem.studentName || ""}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, studentName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">School Name</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={editingWinnerItem.schoolName || ""}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, schoolName: e.target.value })}
                        placeholder="e.g. Govt High School"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Class / Grade</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={editingWinnerItem.studentClass || ""}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, studentClass: e.target.value })}
                        placeholder="e.g. Class 8"
                      />
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Roll Number</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={editingWinnerItem.rollNumber || ""}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, rollNumber: e.target.value })}
                        placeholder="e.g. 04"
                      />
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Prize Amount</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={editingWinnerItem.prizeAmount || ""}
                        onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, prizeAmount: e.target.value })}
                        placeholder="e.g. ₹ 5,000"
                      />
                    </div>
                  </div>

                  <div className="admin-sc-field-group">
                    <label className="admin-sc-field-label">Video URL (S3 / YouTube / Drive)</label>
                    <input
                      type="text"
                      className="admin-sc-input"
                      value={editingWinnerItem.videoUrl || ""}
                      onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-ghost"
                      onClick={() => setEditingWinnerItem(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-sc-btn admin-sc-btn-primary"
                    >
                      💾 Save Winner Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PastCompetitionVideosSection;
