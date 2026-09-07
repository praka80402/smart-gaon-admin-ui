import React, { useState, useMemo, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import AsyncVideoPlayer from "../../components/AsyncVideoPlayer";
import "./pastCompetitionVideos.css";

const PastCompetitionVideosSection = ({
  allAdminUploadedVideos = [],
  categories = [],
  prizeVideosLoading = false,
  handleOpenPastPrizeModal,
  handleEditCompetitionGroup,
  handleDeleteCompetitionGroup,
  fetchPrizeVideos,
  fetchSubmissions,
  onAddNewCategory,
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
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  // Pagination state for competitions grid
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [selectedCompetitionModal, setSelectedCompetitionModal] = useState(null);
  const [modalGroupFilter, setModalGroupFilter] = useState("ALL");
  const [editingWinnerItem, setEditingWinnerItem] = useState(null);

  const [addWinnerModalComp, setAddWinnerModalComp] = useState(null);
  const [newWinnerForm, setNewWinnerForm] = useState({
    groupCategory: "Group A (Class 1-2)",
    winnerRank: 1,
    prizeAmount: "",
    studentName: "",
    schoolName: "",
    studentClass: "",
    rollNumber: "",
    videoUrl: "",
    isConsolation: false,
    showOnWeb: true,
  });
  const [addingWinnerLoading, setAddingWinnerLoading] = useState(false);
  const [editingWinnerLoading, setEditingWinnerLoading] = useState(false);
  const [uploadingWinnerFile, setUploadingWinnerFile] = useState(false);

  const handleUploadWinnerFile = async (file, target) => {
    if (!file) return;
    setUploadingWinnerFile(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axiosInstance.post(
        "/admin/school-competitions/prize-videos/upload-video-file",
        formData
      );
      if (res.data && res.data.videoUrl) {
        const uploadedUrl = res.data.videoUrl;
        if (target === "EDIT") {
          setEditingWinnerItem((prev) => (prev ? { ...prev, videoUrl: uploadedUrl } : null));
        } else {
          setNewWinnerForm((prev) => ({ ...prev, videoUrl: uploadedUrl }));
        }
        if (typeof setMsg === "function") {
          setMsg("✓ File uploaded successfully!");
        }
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
      if (typeof setMsg === "function") {
        setMsg("⚠️ Failed to upload file: " + (err.response?.data?.message || err.response?.data || err.message));
      }
    } finally {
      setUploadingWinnerFile(false);
    }
  };

  const handleSearch4thTabVideos = () => {
    setAppliedYearFilter(adminVideoYearFilter);
    setAppliedMonthFilter(adminVideoMonthFilter);
    setAppliedCategoryFilter(adminVideoCategoryFilter);
    setAppliedGroupFilter(adminVideoGroupFilter);
    setHasAppliedFilter(true);
    setCurrentPage(1);
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
    setHasAppliedFilter(false);
    setCurrentPage(1);
  };

  const handleToggleConsolationWebVisibility = async (winnerItem) => {
    try {
      const cleanId = String(winnerItem.id).replace(/^(prize-video-|video-)/, "");
      const res = await axiosInstance.put(
        `/admin/school-competitions/prize-videos/${encodeURIComponent(cleanId)}/toggle-web-visibility`
      );
      const newShowOnWeb = res.data?.showOnWeb !== undefined
        ? res.data.showOnWeb
        : !(winnerItem.showOnWeb === true || winnerItem.showOnWeb === 1 || String(winnerItem.showOnWeb) === "true");

      setSelectedCompetitionModal((prevModal) => {
        if (!prevModal) return null;
        const updatedVideos = prevModal.videos.map((v) =>
          v.id === winnerItem.id ? { ...v, showOnWeb: newShowOnWeb } : v
        );
        return {
          ...prevModal,
          videos: updatedVideos,
        };
      });

      if (typeof setMsg === "function") {
        setMsg(`✓ Consolation winner visibility updated to ${newShowOnWeb ? "VISIBLE" : "HIDDEN"}!`);
      }
    } catch (err) {
      console.error("Error toggling web visibility:", err);
      if (typeof setMsg === "function") {
        setMsg("⚠️ Failed to toggle web visibility for this consolation winner.");
      }
    }
  };

  // Keep selectedCompetitionModal in sync when allAdminUploadedVideos refreshes
  useEffect(() => {
    if (!selectedCompetitionModal) return;
    const compKey = selectedCompetitionModal.competitionId || selectedCompetitionModal.competitionName;
    const matchingVideos = (allAdminUploadedVideos || []).filter((v) => {
      const vKey = v.competitionId || v.competitionName;
      return (
        (selectedCompetitionModal.competitionId && v.competitionId === selectedCompetitionModal.competitionId) ||
        (selectedCompetitionModal.competitionName && v.competitionName === selectedCompetitionModal.competitionName) ||
        (compKey && vKey === compKey)
      );
    });
    if (matchingVideos.length === 0) {
      setSelectedCompetitionModal(null);
    } else {
      setSelectedCompetitionModal((prev) => (prev ? { ...prev, videos: matchingVideos } : null));
    }
  }, [allAdminUploadedVideos]);

  const handleSaveEditedIndividualWinner = async (e) => {
    e.preventDefault();
    if (!editingWinnerItem) return;

    const isKojoWinner = Boolean(
      (editingWinnerItem.competitionType && editingWinnerItem.competitionType.toLowerCase().includes("kojo")) ||
      (editingWinnerItem.competitionName && editingWinnerItem.competitionName.toLowerCase().includes("kojo")) ||
      (editingWinnerItem.category && editingWinnerItem.category.toLowerCase().includes("kojo"))
    );

    if (isKojoWinner && editingWinnerItem.videoUrl) {
      const isVideo = editingWinnerItem.videoUrl.includes("youtube.com") ||
        editingWinnerItem.videoUrl.includes("youtu.be") ||
        editingWinnerItem.videoUrl.match(/\.(mp4|mov|avi|mkv|3gp|webm|wmv|flv)(\?|$)/i) ||
        editingWinnerItem.videoUrl.startsWith("data:video");
      if (isVideo) {
        if (typeof setMsg === "function") {
          setMsg("⚠️ Videos are NOT allowed for Kojo Competition! Please provide a Word (.doc/.docx), PDF (.pdf), TXT (.txt), or Image file.");
        }
        return;
      }
    }

    setEditingWinnerLoading(true);
    try {
      const isSub = editingWinnerItem.isAnnouncedWinner || (editingWinnerItem.id && (String(editingWinnerItem.id).startsWith("sub-") || String(editingWinnerItem.id).startsWith("winner-sub-")));

      if (!isSub && editingWinnerItem.id) {
        const cleanId = String(editingWinnerItem.id).replace(/^(prize-video-|video-)/, "");
        const isConsol = Boolean(editingWinnerItem.isConsolation) || (editingWinnerItem.winnerRank && Number(editingWinnerItem.winnerRank) > 3) || (editingWinnerItem.groupCategory && editingWinnerItem.groupCategory.toLowerCase().includes("consolation"));
        const showWeb = editingWinnerItem.showOnWeb !== undefined
          ? Boolean(editingWinnerItem.showOnWeb)
          : (isConsol ? false : true);

        const payload = {
          competitionId: editingWinnerItem.competitionId || undefined,
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
          isConsolation: isConsol,
          showOnWeb: showWeb,
        };
        await axiosInstance.put(
          `/admin/school-competitions/prize-videos/${encodeURIComponent(cleanId)}`,
          payload
        );
      } else if (editingWinnerItem.id) {
        const subId = String(editingWinnerItem.id).replace(/^(sub-|winner-sub-)/, "");
        await axiosInstance.put(
          `/admin/school-competitions/submissions/${encodeURIComponent(subId)}`,
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
            String(v.id) === String(editingWinnerItem.id) ? { ...v, ...editingWinnerItem } : v
          );
          return { ...prevModal, videos: updatedVideos };
        });
      }

      // 2. Auto-close Edit Winner Modal
      setEditingWinnerItem(null);

      // 3. Set global notification message (centered custom modal, no browser alert!)
      if (typeof setMsg === "function") {
        setMsg("✓ Winner entry updated successfully!");
      }

      // 4. Refresh prize videos from server
      await fetchPrizeVideos();
      if (fetchSubmissions) await fetchSubmissions();
    } catch (err) {
      console.error("Failed to update individual winner", err);
      if (typeof setMsg === "function") {
        setMsg("⚠️ Failed to update winner entry: " + (err.response?.data?.message || err.response?.data || err.message));
      }
    } finally {
      setEditingWinnerLoading(false);
    }
  };

  const handleOpenAddWinnerModal = (comp) => {
    if (!comp) return;
    const isKojo = Boolean(
      (comp.category && comp.category.toLowerCase().includes("kojo")) ||
      (comp.competitionName && comp.competitionName.toLowerCase().includes("kojo"))
    );
    setNewWinnerForm({
      groupCategory: isKojo ? "Group C (Class 6-8)" : "Group A (Class 1-2)",
      winnerRank: 1,
      prizeAmount: "",
      studentName: "",
      schoolName: "",
      studentClass: "",
      rollNumber: "",
      videoUrl: "",
      isConsolation: false,
      showOnWeb: true,
    });
    setAddWinnerModalComp(comp);
  };

  const handleSaveNewWinner = async (e) => {
    e.preventDefault();
    if (!addWinnerModalComp) return;

    const isKojo = Boolean(
      (addWinnerModalComp.category && addWinnerModalComp.category.toLowerCase().includes("kojo")) ||
      (addWinnerModalComp.competitionName && addWinnerModalComp.competitionName.toLowerCase().includes("kojo"))
    );

    if (!newWinnerForm.videoUrl || !newWinnerForm.videoUrl.trim()) {
      if (typeof setMsg === "function") {
        setMsg(isKojo ? "⚠️ Please upload or enter a Word, PDF, TXT, or Image file for the winner!" : "⚠️ Please enter a Video URL for the winner!");
      }
      return;
    }

    if (isKojo) {
      const isVideo = newWinnerForm.videoUrl.includes("youtube.com") ||
        newWinnerForm.videoUrl.includes("youtu.be") ||
        newWinnerForm.videoUrl.match(/\.(mp4|mov|avi|mkv|3gp|webm|wmv|flv)(\?|$)/i) ||
        newWinnerForm.videoUrl.startsWith("data:video");
      if (isVideo) {
        if (typeof setMsg === "function") {
          setMsg("⚠️ Videos are NOT allowed for Kojo Competition! Please upload Word (.doc/.docx), PDF (.pdf), TXT (.txt), or Image files.");
        }
        return;
      }
    }

    const isConsol = Boolean(newWinnerForm.isConsolation) ||
      (newWinnerForm.winnerRank && Number(newWinnerForm.winnerRank) > 3) ||
      (newWinnerForm.groupCategory && newWinnerForm.groupCategory.toLowerCase().includes("consolation"));

    const showWeb = newWinnerForm.showOnWeb !== undefined
      ? Boolean(newWinnerForm.showOnWeb)
      : (isConsol ? false : true);

    const payload = {
      competitionId: addWinnerModalComp.competitionId || ("PAST-" + Date.now()),
      competitionName: addWinnerModalComp.competitionName,
      category: addWinnerModalComp.category,
      competitionType: addWinnerModalComp.category,
      year: addWinnerModalComp.year,
      month: addWinnerModalComp.month,
      groupCategory: newWinnerForm.groupCategory,
      winnerRank: parseInt(newWinnerForm.winnerRank, 10),
      prizeAmount: newWinnerForm.prizeAmount ? newWinnerForm.prizeAmount.trim() : "",
      studentName: newWinnerForm.studentName ? newWinnerForm.studentName.trim() : "",
      schoolName: newWinnerForm.schoolName ? newWinnerForm.schoolName.trim() : "",
      studentClass: newWinnerForm.studentClass ? newWinnerForm.studentClass.trim() : "",
      rollNumber: newWinnerForm.rollNumber ? newWinnerForm.rollNumber.trim() : "",
      videoUrl: newWinnerForm.videoUrl.trim(),
      isPastCompetition: true,
      isConsolation: isConsol,
      showOnWeb: showWeb,
    };

    setAddingWinnerLoading(true);
    try {
      const res = await axiosInstance.post(
        "/admin/school-competitions/prize-videos",
        payload
      );

      const createdWinner = res.data || payload;

      // Dynamically update open modal if currently viewing this competition
      if (selectedCompetitionModal && (selectedCompetitionModal.competitionId === addWinnerModalComp.competitionId || selectedCompetitionModal.competitionName === addWinnerModalComp.competitionName)) {
        setSelectedCompetitionModal((prevModal) => {
          if (!prevModal) return null;
          return {
            ...prevModal,
            videos: [...(prevModal.videos || []), createdWinner],
          };
        });
      }

      setAddWinnerModalComp(null);
      if (typeof setMsg === "function") {
        setMsg(`✓ Winner added successfully to "${addWinnerModalComp.competitionName}"!`);
      }

      await fetchPrizeVideos();
      if (fetchSubmissions) await fetchSubmissions();
    } catch (err) {
      console.error("Failed to add winner to competition", err);
      if (typeof setMsg === "function") {
        setMsg("⚠️ " + (err.response?.data?.message || err.response?.data || "Failed to add winner to competition."));
      }
    } finally {
      setAddingWinnerLoading(false);
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
    // Strictly exclude official prize ceremony videos
    const isCeremony =
      (!v.isPastCompetition || String(v.isPastCompetition) === "false") &&
      !v.studentName &&
      !v.rollNumber &&
      (!v.winnerRank || Number(v.winnerRank) === 0);
    if (isCeremony) return false;

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
  const totalItems = groupedComps.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedComps = groupedComps.slice(startIndex, endIndex);

  const totalUniqueCompetitions = useMemo(() => {
    const compKeys = new Set(
      allAdminUploadedVideos
        .filter((v) => {
          const isCeremony =
            (!v.isPastCompetition || String(v.isPastCompetition) === "false") &&
            !v.studentName &&
            !v.rollNumber &&
            (!v.winnerRank || Number(v.winnerRank) === 0);
          return !isCeremony;
        })
        .map((v) => v.competitionId || v.competitionName)
        .filter(Boolean)
    );
    return compKeys.size;
  }, [allAdminUploadedVideos]);

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
      </div>

      {/* FILTER BAR FOR 4TH TAB WITH SEARCH & RESET BUTTONS */}
      <div className="past-videos-filter-bar">
        <div>
          <label className="admin-sc-field-label">Year</label>
          <select
            className="admin-sc-filter-select past-videos-filter-select"
            value={adminVideoYearFilter}
            onChange={(e) => {
              const val = e.target.value;
              setAdminVideoYearFilter(val);
              setAppliedYearFilter(val);
              setHasAppliedFilter(true);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              const val = e.target.value;
              setAdminVideoMonthFilter(val);
              setAppliedMonthFilter(val);
              setHasAppliedFilter(true);
              setCurrentPage(1);
            }}
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
          <label className="admin-sc-field-label">Competition</label>
          <select
            className="admin-sc-filter-select"
            value={adminVideoCategoryFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "ADD_NEW") {
                if (typeof onAddNewCategory === "function") {
                  onAddNewCategory();
                }
              } else {
                setAdminVideoCategoryFilter(val);
                setAppliedCategoryFilter(val);
                setHasAppliedFilter(true);
                setCurrentPage(1);
              }
            }}
            style={{ width: "170px", backgroundColor: "#fff" }}
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

        <div>
          <label className="admin-sc-field-label">Group Category</label>
          <select
            className="admin-sc-filter-select"
            value={adminVideoGroupFilter}
            onChange={(e) => {
              const val = e.target.value;
              setAdminVideoGroupFilter(val);
              setAppliedGroupFilter(val);
              setHasAppliedFilter(true);
              setCurrentPage(1);
            }}
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
      ) : !hasAppliedFilter ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "16px", border: "2px dashed #cbd5e1", margin: "10px 0 30px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔍</div>
          <h4 style={{ fontSize: "19px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>
            Select a Filter to View Past Videos
          </h4>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 auto 18px auto", maxWidth: "480px", lineHeight: "1.5" }}>
            Please choose a <strong>Year</strong> or <strong>Month</strong> from the filters above and click <strong>Search</strong> to display uploaded competition videos.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="admin-sc-btn admin-sc-btn-outline"
              onClick={() => {
                const curYr = new Date().getFullYear().toString();
                setAdminVideoYearFilter(curYr);
                setAppliedYearFilter(curYr);
                setHasAppliedFilter(true);
              }}
            >
              🗓️ Current Year ({new Date().getFullYear()})
            </button>
          </div>
        </div>
      ) : filteredList.length === 0 ? (
        <p className="admin-sc-empty-note" style={{ padding: "30px 0" }}>
          No past videos match the selected filters.
        </p>
      ) : (
        <div>
          <div className="past-videos-grid">
            {paginatedComps.map((comp) => {
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

                  <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: "1px dashed #e2e8f0", paddingTop: "12px", alignItems: "center" }}>
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
                      className="admin-sc-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddWinnerModal(comp);
                      }}
                      style={{
                        padding: "7px 12px",
                        fontSize: "12px",
                        borderRadius: "8px",
                        background: "#ecfdf5",
                        color: "#047857",
                        border: "1px solid #a7f3d0",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                      title="Add a new winner to this competition"
                    >
                      ➕ Add Winner
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION BAR */}
          {totalItems > 0 && (
            <div className="past-videos-pagination-bar">
              <div className="past-videos-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{totalItems}</strong> competitions
              </div>

              {totalPages > 1 && (
                <div className="past-videos-pagination-controls">
                  <button
                    type="button"
                    className="past-videos-page-btn"
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="First Page"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    className="past-videos-page-btn"
                    disabled={validCurrentPage === 1}
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
                            className={`past-videos-page-btn ${validCurrentPage === p ? "active" : ""}`}
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    type="button"
                    className="past-videos-page-btn"
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Next Page"
                  >
                    Next ›
                  </button>
                  <button
                    type="button"
                    className="past-videos-page-btn"
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Last Page"
                  >
                    »
                  </button>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="admin-sc-filter-select"
                  style={{ width: "70px", padding: "4px 8px", fontSize: "12px", backgroundColor: "#fff" }}
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>
          )}

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
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "16px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className="admin-sc-btn"
                      onClick={() => handleOpenAddWinnerModal(selectedCompetitionModal)}
                      style={{
                        padding: "7px 12px",
                        fontSize: "12px",
                        borderRadius: "8px",
                        background: "#ecfdf5",
                        color: "#047857",
                        border: "1px solid #a7f3d0",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "pointer",
                        fontWeight: "700"
                      }}
                      title="Add a new winner to this competition"
                    >
                      ➕ Add Winner
                    </button>
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
                        marginLeft: "6px"
                      }}
                      title="Close Modal"
                    >
                      ✕
                    </button>
                  </div>
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
                        {groupVideos.sort((a, b) => a.winnerRank - b.winnerRank).map((v) => {
                          const isConsol = Boolean(v.isConsolation) || (v.winnerRank && Number(v.winnerRank) > 3) || (v.groupCategory && v.groupCategory.toLowerCase().includes("consolation"));
                          const isWebVisible = v.showOnWeb === true || v.showOnWeb === 1 || String(v.showOnWeb) === "true";

                          return (
                          <div key={v.id} style={{ background: "#ffffff", padding: "14px", borderRadius: "12px", border: isConsol ? (isWebVisible ? "1.5px solid #10b981" : "1.5px solid #f87171") : "1px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ fontWeight: "700", fontSize: "13px", color: v.winnerRank === 1 ? "#b45309" : v.winnerRank === 2 ? "#475569" : v.winnerRank === 3 ? "#c2410c" : "#d97706" }}>
                                {v.winnerRank === 1 ? "🥇 Rank 1 Winner" : v.winnerRank === 2 ? "🥈 Rank 2 Runner-up" : v.winnerRank === 3 ? "🥉 Rank 3 Runner-up" : `🎁 Consolation #${v.winnerRank - 3 || v.winnerRank}`}
                              </span>
                              <span style={{ fontWeight: "700", fontSize: "13px", color: "#059669" }}>
                                {v.prizeAmount ? (v.prizeAmount.startsWith("₹") ? v.prizeAmount : `₹ ${v.prizeAmount}`) : "—"}
                              </span>
                            </div>

                            {/* Consolation Web Visibility Badge */}
                            {isConsol && (
                              <div style={{ marginBottom: "8px" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    padding: "2px 8px",
                                    borderRadius: "10px",
                                    background: isWebVisible ? "#ecfdf5" : "#fef2f2",
                                    color: isWebVisible ? "#047857" : "#b91c1c",
                                    border: isWebVisible ? "1px solid #a7f3d0" : "1px solid #fecaca",
                                  }}
                                >
                                  {isWebVisible ? "🌐 Visible on Public Web" : "🔒 Hidden from Public Web"}
                                </span>
                              </div>
                            )}

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
                                No Media / File Attached
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "6px", marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                              {isConsol && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleConsolationWebVisibility(v)}
                                  style={{
                                    padding: "6px 10px",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    borderRadius: "6px",
                                    border: isWebVisible ? "1px solid #fca5a5" : "1px solid #6ee7b7",
                                    background: isWebVisible ? "#fff1f2" : "#ecfdf5",
                                    color: isWebVisible ? "#be123c" : "#047857",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s"
                                  }}
                                  title={isWebVisible ? "Click to hide from public website" : "Click to show on public website"}
                                >
                                  {isWebVisible ? "🔒 Hide from Web" : "🌐 Show on Web"}
                                </button>
                              )}
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-warning"
                                onClick={() => setEditingWinnerItem({ ...v })}
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}
                                title="Edit Winner Details"
                              >
                                ✏️ Edit Winner Details
                              </button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EDIT INDIVIDUAL WINNER MODAL */}
          {editingWinnerItem && (
            <div className="admin-sc-modal-overlay" style={{ zIndex: 9990 }}>
              <div
                className="admin-sc-modal"
                style={{
                  maxWidth: "520px",
                  width: "90%",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  margin: "auto",
                }}
              >
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
                      disabled
                      readOnly
                      style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b", fontWeight: "600" }}
                      title="Competition Name cannot be modified from individual winner edit"
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
                        onChange={(e) => {
                          const rank = parseInt(e.target.value, 10);
                          const isC = rank > 3 || (editingWinnerItem.groupCategory && editingWinnerItem.groupCategory.toLowerCase().includes("consolation"));
                          setEditingWinnerItem({ ...editingWinnerItem, winnerRank: rank, isConsolation: isC });
                        }}
                        style={{ width: "100%", backgroundColor: "#fff" }}
                      >
                        <option value="1">🥇 1st Rank (Winner)</option>
                        <option value="2">🥈 2nd Rank (Runner-up)</option>
                        <option value="3">🥉 3rd Rank (Runner-up)</option>
                        <option value="4">🎁 Consolation #1 (Rank 4)</option>
                        <option value="5">🎁 Consolation #2 (Rank 5)</option>
                        <option value="6">🎁 Consolation #3 (Rank 6)</option>
                      </select>
                    </div>
                  </div>

                  {/* Consolation Web Visibility Toggle inside Edit Modal */}
                  {(Boolean(editingWinnerItem.isConsolation) || (editingWinnerItem.winnerRank && Number(editingWinnerItem.winnerRank) > 3) || (editingWinnerItem.groupCategory && editingWinnerItem.groupCategory.toLowerCase().includes("consolation"))) && (
                    <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "10px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#166534" }}>
                        <input
                          type="checkbox"
                          checked={editingWinnerItem.showOnWeb === true || editingWinnerItem.showOnWeb === 1 || String(editingWinnerItem.showOnWeb) === "true"}
                          onChange={(e) => setEditingWinnerItem({ ...editingWinnerItem, showOnWeb: e.target.checked })}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <span>🌐 Show Consolation Winner on Public Website</span>
                      </label>
                      <span style={{ fontSize: "11px", color: "#15803d", marginLeft: "24px", display: "block", marginTop: "2px" }}>
                        If unchecked, this consolation winner will be hidden from the public website.
                      </span>
                    </div>
                  )}

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
                    {(() => {
                      const isKojoWinner = Boolean(
                        (editingWinnerItem.competitionType && editingWinnerItem.competitionType.toLowerCase().includes("kojo")) ||
                        (editingWinnerItem.competitionName && editingWinnerItem.competitionName.toLowerCase().includes("kojo")) ||
                        (editingWinnerItem.category && editingWinnerItem.category.toLowerCase().includes("kojo"))
                      );

                      return (
                        <>
                          <label className="admin-sc-field-label">
                            {isKojoWinner
                              ? "Document or Image File (Word, PDF, TXT, or Image) *"
                              : "Video URL (S3 / YouTube / Drive)"}
                          </label>

                          {isKojoWinner && (
                            <div style={{ marginBottom: "10px", padding: "10px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "12px", color: "#1e40af" }}>
                              📘 <strong>Kojo Competition:</strong> Videos are <strong>NOT allowed</strong>. Please upload or provide a Word document (.doc, .docx), PDF (.pdf), TXT (.txt) file, or any Image format (.jpg, .jpeg, .png, .gif, .webp, .svg, etc.).
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <input
                              type="file"
                              accept={isKojoWinner ? ".doc,.docx,.pdf,.txt,image/*" : "video/*"}
                              disabled={uploadingWinnerFile}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const f = e.target.files[0];
                                  if (isKojoWinner && (f.type.startsWith("video/") || f.name.match(/\.(mp4|mov|avi|mkv|3gp|webm|wmv|flv)$/i))) {
                                    if (typeof setMsg === "function") {
                                      setMsg("⚠️ Video files are NOT allowed for Kojo Competition! Please select a Word (.doc/.docx), PDF (.pdf), TXT (.txt), or Image file.");
                                    }
                                    e.target.value = "";
                                    return;
                                  }
                                  handleUploadWinnerFile(f, "EDIT");
                                }
                              }}
                              style={{ flex: 1, padding: "6px 10px", fontSize: "12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                            />
                            {uploadingWinnerFile && <span style={{ fontSize: "12px", color: "#2563eb", alignSelf: "center" }}>⏳ Uploading...</span>}
                          </div>

                          <input
                            type="text"
                            className="admin-sc-input"
                            value={editingWinnerItem.videoUrl || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isKojoWinner && (val.includes("youtube.com") || val.includes("youtu.be") || val.match(/\.(mp4|mov|avi|mkv|3gp|webm)(\?|$)/i))) {
                                if (typeof setMsg === "function") {
                                  setMsg("⚠️ Video links are NOT allowed for Kojo Competition! Please enter a link to a Word document, PDF, TXT file, or Image.");
                                }
                                return;
                              }
                              setEditingWinnerItem({ ...editingWinnerItem, videoUrl: val });
                            }}
                            placeholder={isKojoWinner ? "Or paste Word, PDF, TXT or Image link / Drive URL..." : "https://youtube.com/watch?v=..."}
                          />

                          {editingWinnerItem.videoUrl && (
                            <div style={{ marginTop: "10px" }}>
                              <AsyncVideoPlayer videoUrl={editingWinnerItem.videoUrl} />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button
                      type="button"
                      className="admin-sc-btn"
                      onClick={() => setEditingWinnerItem(null)}
                      disabled={editingWinnerLoading}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        fontWeight: "600"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-sc-btn admin-sc-btn-primary"
                      disabled={editingWinnerLoading}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        cursor: editingWinnerLoading ? "not-allowed" : "pointer",
                        backgroundColor: "#2563eb",
                        borderColor: "#2563eb",
                        color: "#ffffff",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {editingWinnerLoading ? "⏳ Saving Changes..." : "💾 Save Winner Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD WINNER TO COMPETITION MODAL */}
          {addWinnerModalComp && (
            <div className="admin-sc-modal-overlay" style={{ zIndex: 9990 }}>
              <div
                className="admin-sc-modal"
                style={{
                  maxWidth: "540px",
                  width: "90%",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  margin: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                      ➕ Add Winner to Competition
                    </h3>
                    <span style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", display: "block" }}>
                      {addWinnerModalComp.competitionName} • {addWinnerModalComp.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddWinnerModalComp(null)}
                    style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveNewWinner}>
                  <div className="admin-sc-field-group">
                    <label className="admin-sc-field-label">Competition Name</label>
                    <input
                      type="text"
                      className="admin-sc-input"
                      value={addWinnerModalComp.competitionName || ""}
                      disabled
                      readOnly
                      style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b", fontWeight: "600" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Group Category</label>
                      {(() => {
                        const isKojo = Boolean(
                          (addWinnerModalComp.category && addWinnerModalComp.category.toLowerCase().includes("kojo")) ||
                          (addWinnerModalComp.competitionName && addWinnerModalComp.competitionName.toLowerCase().includes("kojo"))
                        );
                        return (
                          <>
                            <select
                              className="admin-sc-filter-select"
                              value={isKojo ? "Group C (Class 6-8)" : (newWinnerForm.groupCategory || "Group A (Class 1-2)")}
                              onChange={(e) => {
                                const cat = e.target.value;
                                const isC = cat.toLowerCase().includes("consolation") || Number(newWinnerForm.winnerRank) > 3;
                                setNewWinnerForm({ ...newWinnerForm, groupCategory: cat, isConsolation: isC });
                              }}
                              style={{ width: "100%", backgroundColor: "#fff" }}
                            >
                              {isKojo ? (
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
                            {isKojo && (
                              <span style={{ fontSize: "11px", color: "#2563eb", marginTop: "4px", display: "block", fontWeight: "600" }}>
                                ℹ️ Kojo: Only Group C participates.
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
                        value={String(newWinnerForm.winnerRank || 1)}
                        onChange={(e) => {
                          const rank = parseInt(e.target.value, 10);
                          const isC = rank > 3 || (newWinnerForm.groupCategory && newWinnerForm.groupCategory.toLowerCase().includes("consolation"));
                          setNewWinnerForm({ ...newWinnerForm, winnerRank: rank, isConsolation: isC });
                        }}
                        style={{ width: "100%", backgroundColor: "#fff" }}
                      >
                        <option value="1">🥇 1st Rank (Winner)</option>
                        <option value="2">🥈 2nd Rank (Runner-up)</option>
                        <option value="3">🥉 3rd Rank (Runner-up)</option>
                        <option value="4">🎁 Consolation #1 (Rank 4)</option>
                        <option value="5">🎁 Consolation #2 (Rank 5)</option>
                        <option value="6">🎁 Consolation #3 (Rank 6)</option>
                      </select>
                    </div>
                  </div>

                  {/* Consolation Web Visibility Toggle inside Add Winner Modal */}
                  {(Boolean(newWinnerForm.isConsolation) || (newWinnerForm.winnerRank && Number(newWinnerForm.winnerRank) > 3) || (newWinnerForm.groupCategory && newWinnerForm.groupCategory.toLowerCase().includes("consolation"))) && (
                    <div style={{ marginBottom: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "10px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", color: "#166534" }}>
                        <input
                          type="checkbox"
                          checked={newWinnerForm.showOnWeb === true || newWinnerForm.showOnWeb === 1 || String(newWinnerForm.showOnWeb) === "true"}
                          onChange={(e) => setNewWinnerForm({ ...newWinnerForm, showOnWeb: e.target.checked })}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <span>🌐 Show Consolation Winner on Public Website</span>
                      </label>
                      <span style={{ fontSize: "11px", color: "#15803d", marginLeft: "24px", display: "block", marginTop: "2px" }}>
                        If unchecked, this consolation winner will be hidden from the public website.
                      </span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Student Name *</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={newWinnerForm.studentName}
                        onChange={(e) => setNewWinnerForm({ ...newWinnerForm, studentName: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">School Name</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={newWinnerForm.schoolName}
                        onChange={(e) => setNewWinnerForm({ ...newWinnerForm, schoolName: e.target.value })}
                        placeholder="e.g. Govt High School"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Class Grade</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={newWinnerForm.studentClass}
                        onChange={(e) => setNewWinnerForm({ ...newWinnerForm, studentClass: e.target.value })}
                        placeholder="e.g. Class 5"
                      />
                    </div>

                    <div className="admin-sc-field-group">
                      <label className="admin-sc-field-label">Roll Number</label>
                      <input
                        type="text"
                        className="admin-sc-input"
                        value={newWinnerForm.rollNumber}
                        onChange={(e) => setNewWinnerForm({ ...newWinnerForm, rollNumber: e.target.value })}
                        placeholder="e.g. 12"
                      />
                    </div>
                  </div>

                  <div className="admin-sc-field-group">
                    <label className="admin-sc-field-label">Prize Amount</label>
                    <input
                      type="text"
                      className="admin-sc-input"
                      value={newWinnerForm.prizeAmount}
                      onChange={(e) => setNewWinnerForm({ ...newWinnerForm, prizeAmount: e.target.value })}
                      placeholder="e.g. ₹ 5,000"
                    />
                  </div>

                  <div className="admin-sc-field-group">
                    {(() => {
                      const isKojo = Boolean(
                        (addWinnerModalComp.category && addWinnerModalComp.category.toLowerCase().includes("kojo")) ||
                        (addWinnerModalComp.competitionName && addWinnerModalComp.competitionName.toLowerCase().includes("kojo"))
                      );

                      return (
                        <>
                          <label className="admin-sc-field-label">
                            {isKojo
                              ? "Document or Image File (Word, PDF, TXT, or Image) *"
                              : "Video URL (YouTube / Google Drive / S3) *"}
                          </label>

                          {isKojo && (
                            <div style={{ marginBottom: "10px", padding: "10px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", fontSize: "12px", color: "#1e40af" }}>
                              📘 <strong>Kojo Competition:</strong> Videos are <strong>NOT allowed</strong>. Please upload or provide a Word document (.doc, .docx), PDF (.pdf), TXT (.txt) file, or any Image format (.jpg, .jpeg, .png, .gif, .webp, .svg, etc.).
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                            <input
                              type="file"
                              accept={isKojo ? ".doc,.docx,.pdf,.txt,image/*" : "video/*"}
                              disabled={uploadingWinnerFile}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const f = e.target.files[0];
                                  if (isKojo && (f.type.startsWith("video/") || f.name.match(/\.(mp4|mov|avi|mkv|3gp|webm|wmv|flv)$/i))) {
                                    if (typeof setMsg === "function") {
                                      setMsg("⚠️ Video files are NOT allowed for Kojo Competition! Please select a Word (.doc/.docx), PDF (.pdf), TXT (.txt), or Image file.");
                                    }
                                    e.target.value = "";
                                    return;
                                  }
                                  handleUploadWinnerFile(f, "NEW");
                                }
                              }}
                              style={{ flex: 1, padding: "6px 10px", fontSize: "12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                            />
                            {uploadingWinnerFile && <span style={{ fontSize: "12px", color: "#2563eb", alignSelf: "center" }}>⏳ Uploading...</span>}
                          </div>

                          <input
                            type="text"
                            className="admin-sc-input"
                            value={newWinnerForm.videoUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isKojo && (val.includes("youtube.com") || val.includes("youtu.be") || val.match(/\.(mp4|mov|avi|mkv|3gp|webm)(\?|$)/i))) {
                                if (typeof setMsg === "function") {
                                  setMsg("⚠️ Video links are NOT allowed for Kojo Competition! Please enter a link to a Word document, PDF, TXT file, or Image.");
                                }
                                return;
                              }
                              setNewWinnerForm({ ...newWinnerForm, videoUrl: val });
                            }}
                            placeholder={isKojo ? "Or paste Word, PDF, TXT or Image link / Drive URL..." : "https://youtube.com/watch?v=..."}
                            required={!newWinnerForm.videoUrl}
                          />

                          {newWinnerForm.videoUrl && (
                            <div style={{ marginTop: "10px" }}>
                              <AsyncVideoPlayer videoUrl={newWinnerForm.videoUrl} />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button
                      type="button"
                      className="admin-sc-btn"
                      onClick={() => setAddWinnerModalComp(null)}
                      disabled={addingWinnerLoading}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        fontWeight: "600"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-sc-btn admin-sc-btn-primary"
                      disabled={addingWinnerLoading}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        cursor: addingWinnerLoading ? "not-allowed" : "pointer",
                        background: "#059669",
                        borderColor: "#059669",
                        color: "#fff",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {addingWinnerLoading ? "⏳ Adding Winner..." : "✓ Add Winner"}
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
