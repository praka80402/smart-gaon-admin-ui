import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import * as XLSX from "xlsx";
import "./adminSchoolCompetition.css";

function AsyncVideoPlayer({ videoUrl }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (videoUrl && videoUrl.startsWith("data:video")) {
      setLoading(true);
      fetch(videoUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (active) {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Async video fetch error:", err);
          if (active) setLoading(false);
        });
    } else {
      setBlobUrl(videoUrl);
    }
    return () => {
      active = false;
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [videoUrl]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#0f172a", padding: 30, borderRadius: 8, color: "#38bdf8", textAlign: "center" }}>
        ⏳ Loading & Decoding High Quality Video Stream...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0f172a", padding: 10, borderRadius: 8, textAlign: "center" }}>
      <video
        key={blobUrl || "vid-player"}
        src={blobUrl || videoUrl}
        controls
        autoPlay
        playsInline
        style={{ width: "100%", maxHeight: "480px", borderRadius: 6, objectFit: "contain", backgroundColor: "#000" }}
      />
    </div>
  );
}

export default function AdminCompetitionManager() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSubmissions, setExpandedSubmissions] = useState({}); // Tracks which submission's evaluation details are expanded
  const [marksSortOrder, setMarksSortOrder] = useState("NONE"); // Tracks sorting for Judge Marks: "NONE", "DESC", "ASC"

  const [masterSchools, setMasterSchools] = useState([]);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [masterSchoolInput, setMasterSchoolInput] = useState({
    name: "",
    address: "",
    code: "",
  });
  const [masterSchoolInputMode, setMasterSchoolInputMode] = useState("MANUAL"); // MANUAL vs FILE

  useEffect(() => {
    fetchCompetitions();
    fetchSubmissions();
    fetchMasterSchools();
    fetchPrizeVideos();
  }, []);

  useEffect(() => {
    if (competitions.length > 0) {
      const uniqueCats = Array.from(new Set(competitions.map(c => c.category).filter(Boolean)));
      setCategories(prev => {
        const merged = Array.from(new Set([...prev, ...uniqueCats]));
        return merged;
      });
    }
  }, [competitions]);

  const fetchMasterSchools = async () => {
    try {
      const res = await axiosInstance.get("/admin/school-competitions/schools");
      if (res.data && Array.isArray(res.data)) {
        setMasterSchools(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch master schools", err);
    }
  };

  const handleAddMasterSchoolSingle = async (e) => {
    e.preventDefault();
    if (!masterSchoolInput.name.trim()) return;
    try {
      if (editingSchool) {
        const res = await axiosInstance.put(
          `/admin/school-competitions/schools/${editingSchool.id}`,
          masterSchoolInput,
        );
        setMasterSchools(
          masterSchools.map((s) => (s.id === editingSchool.id ? res.data : s)),
        );
        setMsg(`✓ School '${res.data.name}' updated successfully!`);
      } else {
        const res = await axiosInstance.post(
          "/admin/school-competitions/schools",
          masterSchoolInput,
        );
        setMasterSchools([...masterSchools, res.data]);
        setMsg(`✓ School '${res.data.name}' added successfully!`);
      }
      setMasterSchoolInput({ name: "", address: "", code: "" });
      setEditingSchool(null);
    } catch (err) {
      alert(err.response?.data || "Failed to save school");
    }
  };

  const handleDeleteMasterSchool = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete school '${name}'?`))
      return;
    try {
      await axiosInstance.delete(`/admin/school-competitions/schools/${id}`);
      setMasterSchools(masterSchools.filter((s) => s.id !== id));
      setMsg(`✓ School '${name}' deleted successfully!`);
    } catch (err) {
      alert("Failed to delete school.");
    }
  };

  const [selectedBulkFile, setSelectedBulkFile] = useState(null);

  const handleMasterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedBulkFile(file);
    }
  };

  const handleProcessMasterFileUpload = () => {
    if (!selectedBulkFile) {
      alert("Please choose a file first!");
      return;
    }
    const file = selectedBulkFile;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        let parsedSchools = [];
        const buffer = evt.target.result;

        if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
        ) {
          const workbook = XLSX.read(buffer, {
            type: file.name.endsWith(".csv") ? "string" : "array",
          });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          rawData.forEach((row) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                if (cell !== undefined && cell !== null) {
                  const cleaned = String(cell).trim();
                  if (
                    cleaned &&
                    cleaned.length >= 3 &&
                    !/^\d+$/.test(cleaned) &&
                    !/^\+?\d[\d\s-]{8,}$/.test(cleaned) &&
                    !/^s\.?no$/i.test(cleaned) &&
                    !/^sr\.?no$/i.test(cleaned) &&
                    !/^sl\.?no$/i.test(cleaned) &&
                    !/^school\s*name$/i.test(cleaned) &&
                    !/^schools\s*list$/i.test(cleaned) &&
                    !/^address$/i.test(cleaned) &&
                    !/^contact\s*number$/i.test(cleaned) &&
                    !/^phone\s*number$/i.test(cleaned)
                  ) {
                    parsedSchools.push(cleaned);
                  }
                }
              });
            }
          });
        } else {
          const lines = String(buffer)
            .split(/\r\n|\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 2);
          parsedSchools = lines;
        }

        const uniqueSchools = Array.from(
          new Set(parsedSchools.map((s) => s.trim())),
        ).filter(Boolean);

        if (uniqueSchools.length > 0) {
          const res = await axiosInstance.post(
            "/admin/school-competitions/schools/bulk",
            uniqueSchools,
          );
          fetchMasterSchools();
          setMsg(
            `✓ ${uniqueSchools.length} school names added to Central Schools List!`,
          );
          setSelectedBulkFile(null);
        } else {
          alert("No valid school names found in file.");
        }
      } catch (err) {
        console.error("Error reading school file", err);
        alert("Error parsing file.");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/school-competitions");
      if (res.data && Array.isArray(res.data)) {
        setCompetitions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin competitions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axiosInstance.get(
        "/admin/school-competitions/submissions",
      );
      if (res.data && Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    }
  };

  const handleRenameCategory = async (oldName, newName) => {
    if (!newName.trim()) {
      alert("Category name cannot be blank.");
      return;
    }
    try {
      await axiosInstance.put(`/admin/school-competitions/categories/rename?oldName=${encodeURIComponent(oldName)}&newName=${encodeURIComponent(newName.trim())}`);
      setCategories(prev => prev.map(c => c === oldName ? newName.trim() : c));
      setEditingCategoryIndex(null);
      setEditingCategoryValue("");
      fetchCompetitions();
      setMsg(`Category "${oldName}" renamed to "${newName}" successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to rename category.");
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? All active competitions using this category will be reset to "General".`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/admin/school-competitions/categories/delete?name=${encodeURIComponent(name)}`);
      setCategories(prev => prev.filter(c => c !== name));
      fetchCompetitions();
      setMsg(`Category "${name}" deleted successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete category.");
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [schoolInputMode, setSchoolInputMode] = useState("MANUAL"); // MANUAL vs FILE
  const [schoolNameInput, setSchoolNameInput] = useState("");
  const [schoolList, setSchoolList] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [newComp, setNewComp] = useState({
    competitionId: "",
    title: "",
    description: "",
    category: "Public Speaking",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "2026-08-31",
    verificationCode: "",
    winnerAnnouncementMode: "MANUAL",
  });

  const [categories, setCategories] = useState(["Public Speaking", "Science Project", "Kojo Competition"]);
  const [isCreatingCustomCategory, setIsCreatingCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");

  const [msg, setMsg] = useState("");
  const [deleteTargetComp, setDeleteTargetComp] = useState(null);
  const [deleteWarningMsg, setDeleteWarningMsg] = useState("");

  const handleAddSchoolName = () => {
    if (!schoolNameInput.trim()) return;
    if (!schoolList.includes(schoolNameInput.trim())) {
      setSchoolList([...schoolList, schoolNameInput.trim()]);
    }
    setSchoolNameInput("");
  };

  const handleRemoveSchool = (name) => {
    setSchoolList(schoolList.filter((s) => s !== name));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        let parsedSchools = [];
        const buffer = evt.target.result;

        if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
        ) {
          const workbook = XLSX.read(buffer, {
            type: file.name.endsWith(".csv") ? "string" : "array",
          });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          rawData.forEach((row) => {
            if (Array.isArray(row)) {
              row.forEach((cell) => {
                if (cell !== undefined && cell !== null) {
                  const cleaned = String(cell).trim();
                  // Check if cell is a valid school name (not pure numbers, not header titles)
                  if (
                    cleaned &&
                    cleaned.length >= 3 &&
                    !/^\d+$/.test(cleaned) && // Exclude serial numbers like 1, 2, 10, 11
                    !/^\+?\d[\d\s-]{8,}$/.test(cleaned) && // Exclude phone numbers
                    !/^s\.?no$/i.test(cleaned) &&
                    !/^sr\.?no$/i.test(cleaned) &&
                    !/^sl\.?no$/i.test(cleaned) &&
                    !/^school\s*name$/i.test(cleaned) &&
                    !/^schools\s*list$/i.test(cleaned) &&
                    !/^address$/i.test(cleaned) &&
                    !/^contact\s*number$/i.test(cleaned) &&
                    !/^phone\s*number$/i.test(cleaned)
                  ) {
                    parsedSchools.push(cleaned);
                  }
                }
              });
            }
          });
        } else {
          const lines = String(buffer)
            .split(/\r\n|\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 2);
          parsedSchools = lines;
        }

        const uniqueSchools = Array.from(
          new Set(parsedSchools.map((s) => s.trim())),
        ).filter(Boolean);

        if (uniqueSchools.length > 0) {
          setSchoolList((prev) =>
            Array.from(new Set([...prev, ...uniqueSchools])),
          );
          setMsg(
            `✓ ${uniqueSchools.length} school names extracted from '${file.name}'!`,
          );
        } else {
          alert("No school names found in the file.");
        }
      } catch (err) {
        console.error("Error reading school file", err);
        alert("Error parsing file.");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newComp,
        participatingSchools: schoolList,
        isLive: true,
        status: "LIVE",
      };
      const res = await axiosInstance.post(
        "/admin/school-competitions",
        payload,
      );
      setCompetitions((prev) => [...prev, res.data]);
      setMsg(`Competition '${newComp.title}' created successfully!`);
      setShowModal(false);
      setSchoolList([]);
      setUploadedFileName("");
      setIsCreatingCustomCategory(false);
      setCustomCategoryName("");
      setNewComp({
        competitionId: "",
        title: "",
        description: "",
        category: "Public Speaking",
        verificationCode: "",
        winnerAnnouncementMode: "MANUAL",
      });
    } catch (err) {
      console.error("Create Competition Error:", err);
      const serverErr =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Failed to create competition on server.";
      alert(`⚠️ Create Competition Error: ${serverErr}`);
    }
  };

  const toggleLiveStatus = async (comp) => {
    try {
      const res = await axiosInstance.put(
        `/admin/school-competitions/${comp.competitionId}/toggle-live`,
      );
      setCompetitions(
        competitions.map((c) =>
          c.competitionId === comp.competitionId ? res.data : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWinnerMode = async (comp) => {
    try {
      const res = await axiosInstance.put(
        `/admin/school-competitions/${comp.competitionId}/toggle-winner-mode`,
      );
      setCompetitions(
        competitions.map((c) =>
          c.competitionId === comp.competitionId ? res.data : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [editingComp, setEditingComp] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditingCustomCategory, setIsEditingCustomCategory] = useState(false);
  const [editCustomCategoryName, setEditCustomCategoryName] = useState("");

  const toDateInputValue = (val) => {
    if (!val) return "";
    const str = String(val);
    return str.length >= 10 ? str.slice(0, 10) : str;
  };

  const COMPETITION_CATEGORIES = [
    "Public Speaking",
    "Science Project",
    "Kojo Competition",
  ];

  const handleOpenEdit = (comp) => {
    setEditingComp({
      competitionId: comp.competitionId,
      title: comp.title || "",
      description: comp.description || "",
      category: comp.category || "Public Speaking",
      startDate:
        toDateInputValue(comp.startDate) ||
        new Date().toISOString().split("T")[0],
      endDate: toDateInputValue(comp.endDate) || "2026-08-31",
      verificationCode: comp.verificationCode || "",
      winnerAnnouncementMode: comp.winnerAnnouncementMode || "AUTOMATIC",
      participatingSchools: comp.participatingSchools || [],
    });
    setSchoolList(comp.participatingSchools || []);
    setShowEditModal(true);
  };

  const handleUpdateCompetition = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingComp,
        participatingSchools: schoolList,
      };
      const res = await axiosInstance.put(
        `/admin/school-competitions/${editingComp.competitionId}`,
        payload,
      );
      setCompetitions(
        competitions.map((c) =>
          c.competitionId === editingComp.competitionId ? res.data : c,
        ),
      );
      setMsg(`Competition '${editingComp.title}' updated successfully!`);
      setShowEditModal(false);
      setEditingComp(null);
      setSchoolList([]);
      setIsEditingCustomCategory(false);
      setEditCustomCategoryName("");
    } catch (err) {
      console.error(err);
      alert("Failed to update competition.");
    }
  };

  const handleExportCSV = (filteredSubs) => {
    if (!filteredSubs || filteredSubs.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Submission ID",
      "Competition ID",
      "Student Name",
      "Class & Roll No",
      "Group / Category",
      "School Name",
      "Submitted By",
      "Entry Title",
      "Entry Description",
      "Submission Link / Code Content",
      "Status",
      "Rejection Reason / Rejected By",
      "Winner Rank",
      "Average Score",
      "Judge 1 ID",
      "Judge 1 Score",
      "Judge 1 Remarks",
      "Judge 2 ID",
      "Judge 2 Score",
      "Judge 2 Remarks",
      "Judge 3 ID",
      "Judge 3 Score",
      "Judge 3 Remarks"
    ];

    const rows = filteredSubs.map((s) => {
      const clean = (val) => {
        if (val === null || val === undefined) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const classRoll = `Class ${s.classGrade || ""}, Roll ${s.rollNumber || ""}`;
      const rejection = s.status === "REJECTED" ? `${s.rejectionReason || ""} (Rejected By: ${s.rejectedBy || ""})` : "";
      const winnerRank = s.winnerRank ? `${s.winnerRank}` : "—";
      const judgeMarks = s.totalScore !== null && s.totalScore !== undefined ? `${s.totalScore}` : "—";

      const evaluations = s.evaluations || [];
      let ev1 = evaluations[0] || {};
      const ev2 = evaluations[1] || {};
      const ev3 = evaluations[2] || {};

      if (evaluations.length === 0 && s.totalScore !== null && s.totalScore !== undefined) {
        ev1 = {
          judgeId: "Legacy Judge",
          totalScore: s.totalScore,
          remarks: s.judgeRemarks || ""
        };
      }

      const judge1Id = ev1.judgeId || "—";
      const judge1Score = ev1.totalScore !== undefined ? `${ev1.totalScore}` : "—";
      const judge1Remarks = ev1.remarks || "—";

      const judge2Id = ev2.judgeId || "—";
      const judge2Score = ev2.totalScore !== undefined ? `${ev2.totalScore}` : "—";
      const judge2Remarks = ev2.remarks || "—";

      const judge3Id = ev3.judgeId || "—";
      const judge3Score = ev3.totalScore !== undefined ? `${ev3.totalScore}` : "—";
      const judge3Remarks = ev3.remarks || "—";

      return [
        clean(s.submissionId),
        clean(s.competitionId),
        clean(s.studentName),
        clean(classRoll),
        clean(s.groupCategory),
        clean(s.schoolName),
        clean(s.submittedBy),
        clean(s.entryTitle),
        clean(s.entryDescription),
        clean(s.videoUrl),
        clean(s.status),
        clean(rejection),
        clean(winnerRank),
        clean(judgeMarks),
        clean(judge1Id),
        clean(judge1Score),
        clean(judge1Remarks),
        clean(judge2Id),
        clean(judge2Score),
        clean(judge2Remarks),
        clean(judge3Id),
        clean(judge3Score),
        clean(judge3Remarks)
      ].join(",");
    });

    const csvData = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const filterName = selectedCompetitionFilter === "ALL" ? "all_competitions" : selectedCompetitionFilter;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `school_competition_submissions_${filterName}_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteCompetition = (comp) => {
    if (!comp.isLive || comp.status === "COMPLETED") {
      setDeleteWarningMsg(
        "⚠️ Over/Completed competitions cannot be deleted once completed or winners are announced!"
      );
      return;
    }
    setDeleteTargetComp(comp);
  };

 
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState("");
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const handleOpenRejectModal = (submissionId) => {
    setRejectingSubmissionId(submissionId);
    setRejectionReasonInput("");
    setShowRejectModal(true);
  };

  const handleConfirmRejectSubmission = async (e) => {
    e.preventDefault();
    if (!rejectionReasonInput.trim()) {
      alert("⚠️ Rejection reason is mandatory!");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/admin/school-competitions/submissions/${rejectingSubmissionId}/reject`,
        { reason: rejectionReasonInput.trim() },
      );
      setSubmissions(
        submissions.map((s) =>
          s.submissionId === rejectingSubmissionId ? res.data : s,
        ),
      );
      setMsg(`✓ Submission '${rejectingSubmissionId}' rejected successfully!`);
      setShowRejectModal(false);
      setRejectingSubmissionId("");
      setRejectionReasonInput("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to reject submission.");
    }
  };

  const handleAnnounceWinner = async (submissionId, rank) => {
    const rankInt = rank ? parseInt(rank, 10) : null;
    try {
      const res = await axiosInstance.post(
        `/admin/school-competitions/submissions/${submissionId}/announce-winner`,
        { winnerRank: rankInt },
      );
      setSubmissions(
        submissions.map((s) =>
          s.submissionId === submissionId ? res.data : s,
        ),
      );
      if (rankInt) {
        const labels = {
          1: "🥇 1st Place Winner",
          2: "🥈 2nd Place Winner",
          3: "🥉 3rd Place Winner",
        };
        setMsg(
          `✓ Submission '${submissionId}' announced as ${labels[rankInt]}!`,
        );
      } else {
        setMsg(`Winner rank cleared for submission '${submissionId}'.`);
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Failed to update winner rank.";
      alert(errorMsg);
    }
  };

  const handleOpenCreate = () => {
    setSchoolList([]);
    setUploadedFileName("");
    setSchoolNameInput("");
    setNewComp({
      competitionId: "",
      title: "",
      description: "",
      category: "Public Speaking",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-08-31",
      verificationCode: "",
      winnerAnnouncementMode: "MANUAL",
    });
    setShowModal(true);
  };

  const handleCloseCreate = () => {
    setShowModal(false);
    setSchoolList([]);
    setUploadedFileName("");
    setSchoolNameInput("");
    setIsCreatingCustomCategory(false);
    setCustomCategoryName("");
  };

  const [activeTab, setActiveTab] = useState("active");
  const [submissions, setSubmissions] = useState([]);
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] =
    useState("NONE");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [subPage, setSubPage] = useState(1);
  const subPageSize = 10;
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
  const [downloadingCompetitionId, setDownloadingCompetitionId] = useState("");

  const handleDeleteSubmission = (subId) => {
    if (
      window.confirm(`Are you sure you want to delete submission '${subId}'?`)
    ) {
      setSubmissions(submissions.filter((s) => s.submissionId !== subId));
      setMsg(`Submission '${subId}' deleted successfully!`);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v");
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeModalTab, setPrizeModalTab] = useState("ADD"); // ADD vs EDIT
  const [prizeVideos, setPrizeVideos] = useState([]);
  const [prizeVideosLoading, setPrizeVideosLoading] = useState(false);
  const [editingPrizeVideoId, setEditingPrizeVideoId] = useState(null);
  const [prizeVideoForm, setPrizeVideoForm] = useState({
    competitionId: "",
    competitionName: "",
    category: "",
    startDate: "",
    endDate: "",
    videoUrl: "",
  });

  // Fetch the persisted list of prize distribution videos from the backend
  const fetchPrizeVideos = async () => {
    setPrizeVideosLoading(true);
    try {
      const res = await axiosInstance.get("/admin/school-competitions/prize-videos");
      if (res.data && Array.isArray(res.data)) {
        setPrizeVideos(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch prize distribution videos", err);
    } finally {
      setPrizeVideosLoading(false);
    }
  };

  const handleOpenPrizeModal = () => {
    setPrizeModalTab("ADD");
    setPrizeVideoForm({
      competitionId: "",
      competitionName: "",
      category: "",
      startDate: "",
      endDate: "",
      videoUrl: "",
    });
    setEditingPrizeVideoId(null);
    setShowPrizeModal(true);
    fetchPrizeVideos();
  };

  const handleClosePrizeModal = () => {
    setShowPrizeModal(false);
    setPrizeVideoForm({
      competitionId: "",
      competitionName: "",
      category: "",
      startDate: "",
      endDate: "",
      videoUrl: "",
    });
    setEditingPrizeVideoId(null);
  };

  const handleSelectPrizeCompetition = (compId) => {
    const comp = competitions.find((c) => c.competitionId === compId);
    setPrizeVideoForm({
      ...prizeVideoForm,
      competitionId: compId,
      competitionName: comp ? comp.title : "",
      category: comp ? comp.category : "",
      startDate: comp ? toDateInputValue(comp.startDate) : "",
      endDate: comp ? toDateInputValue(comp.endDate) : "",
    });
  };

  const handleSubmitPrizeVideo = async (e) => {
    e.preventDefault();
    if (!prizeVideoForm.competitionId) {
      alert("⚠️ Please select a Competition ID!");
      return;
    }
    if (!prizeVideoForm.videoUrl.trim()) {
      alert("⚠️ Please paste a Video URL!");
      return;
    }

    const payload = {
      competitionId: prizeVideoForm.competitionId,
      videoUrl: prizeVideoForm.videoUrl.trim(),
    };

    try {
      if (editingPrizeVideoId) {
        await axiosInstance.put(
          `/admin/school-competitions/prize-videos/${editingPrizeVideoId}`,
          payload,
        );
        setMsg(
          `✓ Prize distribution video for '${prizeVideoForm.competitionName || prizeVideoForm.competitionId}' updated successfully!`,
        );
      } else {
        await axiosInstance.post(
          "/admin/school-competitions/prize-videos",
          payload,
        );
        setMsg(
          `✓ Prize distribution video for '${prizeVideoForm.competitionName || prizeVideoForm.competitionId}' added successfully!`,
        );
      }

      await fetchPrizeVideos();
      setPrizeVideoForm({
        competitionId: "",
        competitionName: "",
        category: "",
        startDate: "",
        endDate: "",
        videoUrl: "",
      });
      setEditingPrizeVideoId(null);
      setPrizeModalTab("EDIT");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to save prize distribution video.");
    }
  };

  const handleEditPrizeVideo = (video) => {
    setPrizeVideoForm({
      competitionId: video.competitionId,
      competitionName: video.competitionName,
      category: video.category,
      startDate: toDateInputValue(video.startDate),
      endDate: toDateInputValue(video.endDate),
      videoUrl: video.videoUrl,
    });
    setEditingPrizeVideoId(video.id);
    setPrizeModalTab("ADD");
  };

  const handleDeletePrizeVideo = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this prize distribution video?",
      )
    )
      return;
    try {
      await axiosInstance.delete(`/admin/school-competitions/prize-videos/${id}`);
      await fetchPrizeVideos();
      setMsg("✓ Prize distribution video deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to delete prize distribution video.");
    }
  };

  const isLiveFlag = (c) =>
    c.isLive === true || c.isLive === 1 || String(c.isLive) === "true";
  const isUpcomingComp = (c) =>
    c.status === "UPCOMING" ||
    (c.startDate && new Date(c.startDate) > new Date());
  const isPastComp = (c) =>
    !isUpcomingComp(c) &&
    (!isLiveFlag(c) ||
      c.status === "COMPLETED" ||
      (c.endDate && new Date(c.endDate) < new Date()));
  const isActiveComp = (c) =>
    !isUpcomingComp(c) && !isPastComp(c) && isLiveFlag(c);

  const statusClass = (c) => {
    if (isUpcomingComp(c)) return "status-upcoming";
    if (isActiveComp(c)) return "status-live";
    return "status-past";
  };

  const getAutoWinnerRank = (sub) => {
    const comp = competitions.find((c) => c.competitionId === sub.competitionId);
    if (!comp || comp.winnerAnnouncementMode !== "AUTOMATIC") return null;

    // Filter submissions of the same competition and groupCategory
    const groupSubs = submissions.filter(
      (s) =>
        s.competitionId === sub.competitionId &&
        s.groupCategory === sub.groupCategory &&
        s.status !== "REJECTED"
    );

    if (groupSubs.length === 0) return null;

    // Check if ALL active submissions in this category have been evaluated by ALL judges
    const requiredJudges = sub.totalJudges || 3;
    const allEvaluated = groupSubs.every(s => {
      const evalsCount = s.evaluations ? s.evaluations.length : 0;
      return evalsCount >= requiredJudges;
    });

    if (!allEvaluated) {
      return null; // Not all judges have graded all entries in this category yet
    }

    const evaluatedSubs = groupSubs.filter(s => s.totalScore !== undefined && s.totalScore !== null);

    // Sort by totalScore descending
    const sorted = [...evaluatedSubs].sort((a, b) => b.totalScore - a.totalScore);

    // Find the rank (index + 1)
    const idx = sorted.findIndex((s) => s.submissionId === sub.submissionId);
    if (idx >= 0 && idx < 3) {
      return idx + 1; // 1, 2, or 3
    }
    return null;
  };

  const rankClass = (sub, isManualMode) => {
    if (isManualMode) {
      if (!sub.winnerRank) return "pending";
      if (sub.winnerRank === 1) return "rank-1";
      if (sub.winnerRank === 2) return "rank-2";
      if (sub.winnerRank === 3) return "rank-3";
    } else {
      const autoRank = getAutoWinnerRank(sub);
      if (autoRank === 1) return "rank-1";
      if (autoRank === 2) return "rank-2";
      if (autoRank === 3) return "rank-3";
    }
    return "";
  };

  return (
    <div className="admin-sc-container">
      <main className="admin-sc-main">
        {/* ============ HEADER ============ */}
        <div className="admin-sc-header-card">
          <div>
            <div className="admin-sc-header-eyebrow">
              Shiksha Sahayak · School Competitions
            </div>
            <h2>Admin Competition Control Center</h2>
            <p>
              Super Admin &amp; State Admin — manage competitions, review
              student submissions, toggle live status, and set winner mode.
            </p>
          </div>
          <div className="admin-sc-header-actions">
            <button
              className="admin-sc-btn admin-sc-btn-outline"
              onClick={() => setShowSchoolModal(true)}
            >
              🏫 Manage Schools{" "}
              <span
                className="admin-sc-stamp"
                style={{ marginLeft: 6, opacity: 0.9 }}
              >
                {masterSchools.length}
              </span>
            </button>
            <button
              className="admin-sc-btn admin-sc-btn-outline"
              onClick={handleOpenPrizeModal}
            >
              🎬 Upload Prize Distribution Video
            </button>
            <button
              className="admin-sc-btn admin-sc-btn-outline"
              onClick={() => setIsManageCategoriesModalOpen(true)}
            >
              🏷️ Manage Categories
            </button>
            <button
              className="admin-sc-btn admin-sc-btn-accent"
              onClick={handleOpenCreate}
            >
              + Create New Competition
            </button>
          </div>
        </div>

        {/* ============ TABS ============ */}
        <div className="admin-sc-tabs-nav">
          <button
            className={`admin-sc-tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("active");
              setSelectedCompetitionFilter("NONE");
            }}
          >
            🏆 Active
            <span className="admin-sc-tab-count">
              {competitions.filter(isActiveComp).length}
            </span>
          </button>

          <button
            className={`admin-sc-tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("upcoming");
              setSelectedCompetitionFilter("NONE");
            }}
          >
            ⏳ Upcoming
            <span className="admin-sc-tab-count">
              {competitions.filter(isUpcomingComp).length}
            </span>
          </button>

          <button
            className={`admin-sc-tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("past");
              setSelectedCompetitionFilter("NONE");
            }}
          >
            📜 Past
            <span className="admin-sc-tab-count">
              {competitions.filter(isPastComp).length}
            </span>
          </button>
        </div>

        {deleteWarningMsg && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 2000 }}>
            <div className="admin-sc-modal" style={{ maxWidth: 450, padding: "30px 24px", textAlign: "center", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fffbeb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                border: "2px solid #fbbf24",
                color: "#d97706",
                fontSize: "30px"
              }}>
                ⚠️
              </div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "600", color: "var(--sc-navy)" }}>
                Warning
              </h3>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.5", margin: "0 0 24px 0" }}>
                {deleteWarningMsg}
              </p>
              <button
                type="button"
                className="admin-sc-btn admin-sc-btn-accent solid"
                onClick={() => setDeleteWarningMsg("")}
                style={{ width: "120px", padding: "10px 24px", borderRadius: "8px", margin: "0 auto", display: "block", cursor: "pointer" }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {deleteTargetComp && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 2000 }}>
            <div className="admin-sc-modal" style={{ maxWidth: 450, padding: "30px 24px", textAlign: "center", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                border: "2px solid #fca5a5",
                color: "#dc2626",
                fontSize: "30px"
              }}>
                🗑️
              </div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "600", color: "var(--sc-navy)" }}>
                Delete Competition?
              </h3>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.5", margin: "0 0 24px 0" }}>
                Are you sure you want to delete competition <strong>'{deleteTargetComp.title}'</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button
                  type="button"
                  className="admin-sc-btn"
                  onClick={() => setDeleteTargetComp(null)}
                  style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer", backgroundColor: "#e2e8f0", color: "#475569", border: "none", fontWeight: "600" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-sc-btn"
                  onClick={async () => {
                    const comp = deleteTargetComp;
                    setDeleteTargetComp(null);
                    try {
                      await axiosInstance.delete(`/admin/school-competitions/${comp.competitionId}`);
                      setCompetitions(competitions.filter((c) => c.competitionId !== comp.competitionId));
                      setMsg(`Competition '${comp.title}' deleted successfully!`);
                    } catch (err) {
                      console.error(err);
                      setDeleteWarningMsg(err.response?.data || "Failed to delete competition.");
                    }
                  }}
                  style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer", backgroundColor: "#dc2626", color: "white", border: "none", fontWeight: "600" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {msg && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 2000 }}>
            <div className="admin-sc-modal" style={{ maxWidth: 450, padding: "30px 24px", textAlign: "center", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                border: "2px solid #34d399",
                color: "#10b981",
                fontSize: "30px"
              }}>
                ✓
              </div>
              <h3 style={{ margin: "0 0 10px 0", fontFamily: "var(--sc-font-display)", fontSize: "20px", fontWeight: "600", color: "var(--sc-navy)" }}>
                Success!
              </h3>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.5", margin: "0 0 24px 0" }}>
                {msg}
              </p>
              <button
                type="button"
                className="admin-sc-btn admin-sc-btn-accent solid"
                style={{ width: "120px", padding: "10px 24px", borderRadius: "8px", margin: "0 auto", display: "block", cursor: "pointer" }}
                onClick={() => setMsg("")}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: COMPETITIONS TABLE FOR ACTIVE / UPCOMING / PAST */}
        <div className="admin-sc-panel-card">
          <h3 className="admin-sc-panel-title">
            {activeTab === "active" && "🏆 Active Competitions"}
            {activeTab === "upcoming" && "⏳ Upcoming Competitions"}
            {activeTab === "past" && "📜 Past Competitions"}
          </h3>

          {(() => {
            const filteredComps = competitions.filter((c) => {
              if (activeTab === "active") return isActiveComp(c);
              if (activeTab === "upcoming") return isUpcomingComp(c);
              if (activeTab === "past") return isPastComp(c);
              return true;
            });

            if (filteredComps.length === 0) {
              return (
                <p className="admin-sc-empty-note">
                  No {activeTab} competitions found.{" "}
                  {activeTab === "active" &&
                    'Click "+ Create New Competition" to create one.'}
                </p>
              );
            }

            return (
              <div className="admin-sc-card-grid">
                {filteredComps.map((c) => {
                  const isSelected =
                    selectedCompetitionFilter === c.competitionId;
                  const isCompleted = !c.isLive || c.status === "COMPLETED";
                  const submissionCount = submissions.filter(
                    (s) => s.competitionId === c.competitionId,
                  ).length;

                  return (
                    <div
                      key={c.competitionId}
                      className={`admin-sc-comp-card ${statusClass(c)} ${isSelected ? "selected" : ""}`}
                    >
                      {/* CARD HEADER */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span className="admin-sc-id-tag">
                              {c.competitionId}
                            </span>
                            <span
                              style={{
                                backgroundColor: "rgba(108, 92, 231, 0.1)",
                                color: "rgb(108, 92, 231)",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                border: "1px solid rgba(108, 92, 231, 0.2)"
                              }}
                            >
                              🏷️ {c.category || "General"}
                            </span>
                          </div>
                          <span
                            className={`admin-sc-badge ${c.isLive ? "live" : "ended"}`}
                          >
                            {c.isLive ? "● LIVE" : "● ENDED"}
                          </span>
                        </div>

                        <h4
                          style={{
                            fontFamily: "var(--sc-font-display)",
                            fontSize: 18,
                            fontWeight: 600,
                            color: "var(--sc-ink)",
                            margin: "0 0 12px 0",
                            lineHeight: 1.3,
                          }}
                        >
                          {c.title}
                        </h4>

                        {/* COMPETITION METADATA METRICS */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 16,
                          }}
                        >
                          <div className="admin-sc-meta-chip">
                            🏫{" "}
                            <strong style={{ color: "var(--sc-ink)" }}>
                              {c.participatingSchools &&
                              c.participatingSchools.length > 0
                                ? c.participatingSchools.length
                                : Array.from(
                                    new Set(
                                      submissions
                                        .filter(
                                          (s) =>
                                            s.competitionId ===
                                              c.competitionId && s.schoolName,
                                        )
                                        .map((s) =>
                                          s.schoolName.trim().toLowerCase(),
                                        ),
                                    ),
                                  ).length}
                            </strong>{" "}
                            Schools
                          </div>
                          <div className="admin-sc-meta-chip">
                            🔑{" "}
                            <span
                              className="admin-sc-stamp"
                              style={{ color: "var(--sc-navy)" }}
                            >
                              {c.verificationCode}
                            </span>
                          </div>
                          <div
                            className={`admin-sc-meta-chip ${c.winnerAnnouncementMode === "AUTOMATIC" ? "mode-auto" : "mode-manual"}`}
                          >
                            ⚡ {c.winnerAnnouncementMode}
                          </div>
                          <div className="admin-sc-meta-chip">
                            📅 {toDateInputValue(c.startDate) || "—"} →{" "}
                            {toDateInputValue(c.endDate) || "—"}
                          </div>
                        </div>
                      </div>

                      {/* CARD ACTION BUTTONS */}
                      <div
                        style={{
                          paddingTop: 14,
                          borderTop: "1px solid var(--sc-border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          marginTop: "auto",
                        }}
                      >
                        {/* SELECT & VIEW SUBMISSIONS PRIMARY BUTTON */}
                        <button
                          className="admin-sc-btn"
                          onClick={() => {
                            setSelectedCompetitionFilter(c.competitionId);
                            setSelectedGroupFilter("ALL");
                            setTimeout(() => {
                              const subSection = document.getElementById(
                                "student-submissions-section",
                              );
                              if (subSection)
                                subSection.scrollIntoView({
                                  behavior: "smooth",
                                });
                            }, 50);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: isSelected
                              ? "var(--sc-green)"
                              : "var(--sc-navy)",
                            color: "#fff",
                            fontSize: 13,
                            borderRadius: 8,
                            boxShadow: isSelected
                              ? "0 6px 16px -6px rgba(47,143,91,0.5)"
                              : "none",
                          }}
                        >
                          📥 View Submissions ({submissionCount})
                        </button>

                        {/* EDIT, DELETE, TOGGLE LIVE BUTTONS GROUP */}
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              borderRadius: 8,
                              overflow: "hidden",
                              border: "1px solid var(--sc-border)",
                              flex: 1,
                            }}
                          >
                            <button
                              className="admin-sc-btn admin-sc-btn-warning"
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Competition"
                              style={{ flex: 1, fontSize: 12 }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="admin-sc-btn admin-sc-btn-danger"
                              onClick={() => handleDeleteCompetition(c)}
                              disabled={isCompleted}
                              title={
                                isCompleted
                                  ? "Over/Completed competitions cannot be deleted"
                                  : "Delete competition"
                              }
                              style={{
                                flex: 1,
                                fontSize: 12,
                                borderLeft: "1px solid var(--sc-border)",
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          <button
                            className="admin-sc-btn"
                            onClick={() => toggleLiveStatus(c)}
                            style={{
                              padding: "8px 14px",
                              backgroundColor: c.isLive
                                ? "var(--sc-ink-soft)"
                                : "var(--sc-green)",
                              color: "#fff",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          >
                            {c.isLive ? "End" : "Make Live"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* SECTION 2: STUDENT SUBMISSIONS TABLE BELOW (APPEARS WHEN ADMIN SELECTS A COMPETITION) */}
        {selectedCompetitionFilter !== "NONE" && activeTab !== "upcoming" && (
          <div
            id="student-submissions-section"
            className="admin-sc-panel-card no-tab-radius"
          >
            {/* SINGLE LINE ROW FOR HEADING, SEARCH BAR & COMPETITION FILTER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 20,
                flexWrap: "nowrap",
              }}
            >
              <div
                className="admin-sc-panel-title"
                style={{
                  marginBottom: 0,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span>📥 Student Submissions</span>
                <span
                  style={{
                    color: "var(--sc-slate)",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  (
                  {selectedCompetitionFilter === "ALL"
                    ? "All Entries"
                    : selectedCompetitionFilter}
                  )
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                {/* SEARCH INPUT BY STUDENT NAME, SCHOOL, COMPETITION NAME */}
                <input
                  className="admin-sc-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSubPage(1); }}
                  placeholder="🔍 Search Student, School, Competition..."
                  style={{ minWidth: 280, maxWidth: 360, flex: 1 }}
                />

                {/* COMPETITION WISE FILTER DROPDOWN */}
                <select
                  className="admin-sc-filter-select"
                  value={selectedCompetitionFilter}
                  onChange={(e) => { setSelectedCompetitionFilter(e.target.value); setSubPage(1); }}
                >
                  <option value="ALL">
                    All Competitions ({submissions.length})
                  </option>
                  {Array.from(
                    new Set([
                      ...competitions.map((c) => c.competitionId),
                      ...submissions.map((s) => s.competitionId),
                    ]),
                  ).map((compId) => {
                    const comp = competitions.find(
                      (c) => c.competitionId === compId,
                    );
                    const count = submissions.filter(
                      (s) => s.competitionId === compId,
                    ).length;
                    const title = comp ? comp.title : compId;
                    return (
                      <option key={compId} value={compId}>
                        {title} ({compId}) - [{count} entries]
                      </option>
                    );
                  })}
                </select>

                {/* GROUP CATEGORY FILTER DROPDOWN */}
                <select
                  className="admin-sc-filter-select"
                  value={selectedGroupFilter}
                  onChange={(e) => { setSelectedGroupFilter(e.target.value); setSubPage(1); }}
                  style={{ minWidth: 155 }}
                >
                  <option value="ALL">All Groups</option>
                  <option value="Group A (Class 1-2)">Group A (Class 1-2)</option>
                  <option value="Group B (Class 3-5)">Group B (Class 3-5)</option>
                  <option value="Group C (Class 6-8)">Group C (Class 6-8)</option>
                  <option value="Group D (Class 9-12)">Group D (Class 9-12)</option>
                </select>

                {/* EXPORT SUBMISSIONS DATA BUTTON */}
                <button
                  type="button"
                  className="admin-sc-btn"
                  onClick={() => {
                    let temp = selectedCompetitionFilter === "ALL"
                      ? submissions
                      : submissions.filter((s) => s.competitionId === selectedCompetitionFilter);
                    if (selectedGroupFilter !== "ALL") {
                      temp = temp.filter((s) => s.groupCategory === selectedGroupFilter);
                    }
                    if (searchQuery.trim()) {
                      const query = searchQuery.toLowerCase().trim();
                      temp = temp.filter((sub) => {
                        const comp = competitions.find((c) => c.competitionId === sub.competitionId);
                        const compTitle = comp ? comp.title.toLowerCase() : "";
                        return (
                          (sub.studentName && sub.studentName.toLowerCase().includes(query)) ||
                          (sub.schoolName && sub.schoolName.toLowerCase().includes(query)) ||
                          (sub.groupCategory && sub.groupCategory.toLowerCase().includes(query)) ||
                          (sub.entryTitle && sub.entryTitle.toLowerCase().includes(query)) ||
                          (sub.competitionId && sub.competitionId.toLowerCase().includes(query)) ||
                          compTitle.includes(query)
                        );
                      });
                    }
                    handleExportCSV(temp);
                  }}
                  style={{
                    backgroundColor: "var(--sc-green)",
                    color: "#fff",
                    fontWeight: 600,
                    padding: "10px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: "42px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(46, 204, 113, 0.2)",
                  }}
                >
                  📥 Export Data
                </button>
              </div>
            </div>

            {(() => {
              let filteredSubmissions =
                selectedCompetitionFilter === "ALL"
                  ? submissions
                  : submissions.filter(
                      (s) => s.competitionId === selectedCompetitionFilter,
                    );

              if (selectedGroupFilter !== "ALL") {
                filteredSubmissions = filteredSubmissions.filter(
                  (s) => s.groupCategory === selectedGroupFilter,
                );
              }

              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                filteredSubmissions = filteredSubmissions.filter((sub) => {
                  const comp = competitions.find(
                    (c) => c.competitionId === sub.competitionId,
                  );
                  const compTitle = comp ? comp.title.toLowerCase() : "";
                  return (
                    (sub.studentName &&
                      sub.studentName.toLowerCase().includes(query)) ||
                    (sub.schoolName &&
                      sub.schoolName.toLowerCase().includes(query)) ||
                    (sub.groupCategory &&
                      sub.groupCategory.toLowerCase().includes(query)) ||
                    (sub.entryTitle &&
                      sub.entryTitle.toLowerCase().includes(query)) ||
                    (sub.competitionId &&
                      sub.competitionId.toLowerCase().includes(query)) ||
                    compTitle.includes(query)
                  );
                });
              }

              // Apply sorting by Judge Marks
              if (marksSortOrder !== "NONE") {
                filteredSubmissions = filteredSubmissions.sort((a, b) => {
                  const scoreA = a.totalScore || 0;
                  const scoreB = b.totalScore || 0;
                  if (marksSortOrder === "DESC") return scoreB - scoreA;
                  return scoreA - scoreB;
                });
              }

              const totalSubmissions = filteredSubmissions.length;
              if (totalSubmissions === 0) {
                return (
                  <p className="admin-sc-empty-note">
                    No student submissions found matching your filter.
                  </p>
                );
              }

              const totalPages = Math.ceil(totalSubmissions / subPageSize);
              const activePage = Math.min(subPage, totalPages) || 1;
              const startIndex = (activePage - 1) * subPageSize;
              const paginatedSubmissions = filteredSubmissions.slice(
                startIndex,
                startIndex + subPageSize,
              );

              return (
                <>
                  <div style={{ overflowX: "auto" }}>
                  <table className="admin-sc-table">
                    <thead>
                      <tr>
                        <th>Submission Info</th>
                        <th>Student Details</th>
                        <th>School Name</th>
                        <th>Entry Title</th>
                        <th>Video Link</th>
                        <th 
                          onClick={() => {
                            setMarksSortOrder(prev => prev === "NONE" ? "DESC" : prev === "DESC" ? "ASC" : "NONE");
                            setSubPage(1);
                          }}
                          style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                          title="Click to sort by Average Score"
                        >
                          ⭐ Judge Marks <span style={{ fontSize: "10px", marginLeft: "4px" }}>{marksSortOrder === "DESC" ? "▼" : marksSortOrder === "ASC" ? "▲" : "↕"}</span>
                        </th>
                        <th>Actions</th>
                        <th style={{ background: "#2563eb", color: "white", borderRadius: "0 8px 8px 0", textAlign: "center", padding: "10px 16px" }}>
                          🏆 Announce Winner
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSubmissions.map((sub) => (
                        <tr key={sub.submissionId}>
                          <td className="wrap-cell">
                            <div style={{ fontSize: "11px", color: "var(--sc-slate)", fontFamily: "monospace" }}>ID: {sub.submissionId}</div>
                            <div style={{ fontSize: "11px", color: "var(--sc-slate)", fontWeight: 600, marginTop: "4px" }}>Comp: {sub.competitionId}</div>
                            <div style={{ fontSize: "11px", color: "var(--sc-slate)", marginTop: "4px" }}>By: <span style={{ color: "var(--sc-navy)" }}>{sub.submittedBy || "N/A"}</span></div>
                          </td>
                          <td className="wrap-cell" style={{ minWidth: "180px" }}>
                            <div style={{ fontWeight: 700, color: "var(--sc-ink)" }}>{sub.studentName}</div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                              {sub.classGrade} (Roll: {sub.rollNumber})
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              <span className="admin-sc-group-chip" style={{ fontSize: "11px", padding: "2px 6px" }}>
                                {sub.groupCategory || "Group A (Class 1-2)"}
                              </span>
                            </div>
                          </td>
                          <td className="wrap-cell">{sub.schoolName}</td>
                          <td className="wrap-cell">{sub.entryTitle}</td>
                          <td className="nowrap-cell">
                            {sub.videoUrl ? (
                              (sub.videoUrl.startsWith("data:") && !sub.videoUrl.startsWith("data:image") && !sub.videoUrl.startsWith("data:video")) ? (
                                <button
                                  className="admin-sc-btn-play"
                                  style={{ backgroundColor: "#8b5cf6" }}
                                  onClick={() => setPlayingVideoUrl(sub.videoUrl)}
                                >
                                  📄 View Document
                                </button>
                              ) : (!sub.videoUrl.startsWith("data:") && !sub.videoUrl.startsWith("http")) ? (
                                <button
                                  className="admin-sc-btn-play"
                                  style={{ backgroundColor: "#059669" }}
                                  onClick={() => setPlayingVideoUrl(sub.videoUrl)}
                                >
                                  📝 View Code
                                </button>
                              ) : (sub.videoUrl.startsWith("data:image") || sub.videoUrl.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                                <button
                                  className="admin-sc-btn-play"
                                  style={{ backgroundColor: "#0284c7" }}
                                  onClick={() => setPlayingVideoUrl(sub.videoUrl)}
                                >
                                  🖼️ View Image
                                </button>
                              ) : (
                                <button
                                  className="admin-sc-btn-play"
                                  onClick={() => setPlayingVideoUrl(sub.videoUrl)}
                                >
                                  ▶ Play Media
                                </button>
                              )
                            ) : (
                              <span style={{ color: "var(--sc-slate-soft)", fontSize: 12 }}>
                                No Media
                              </span>
                            )}
                          </td>
                          <td>
                            {sub.evaluations && sub.evaluations.length > 0 ? (
                              <div>
                                <div 
                                  style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "space-between", 
                                    padding: "6px 10px", 
                                    background: "#f8fafc", 
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                  }}
                                  onClick={() => setExpandedSubmissions(prev => ({
                                    ...prev,
                                    [sub.submissionId]: !prev[sub.submissionId]
                                  }))}
                                  onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
                                  onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}
                                >
                                  <div style={{ fontSize: 13, fontWeight: "700", color: "var(--sc-navy)" }}>
                                    Total Score: ⭐ {sub.evaluations.reduce((acc, ev) => acc + (ev.totalScore || 0), 0)} / {sub.evaluations.length * 25}
                                  </div>
                                  <div style={{ fontSize: 11, color: "var(--sc-slate-soft)", fontStyle: "italic" }}>
                                    {expandedSubmissions[sub.submissionId] ? "Hide" : "Click to view"}
                                  </div>
                                </div>

                                {expandedSubmissions[sub.submissionId] && (
                                  <div style={{ marginTop: "12px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#ffffff" }}>
                                    {sub.evaluations.map((ev, idx) => (
                                      <div key={idx} style={{ fontSize: 12, marginBottom: 8, borderBottom: idx < sub.evaluations.length - 1 ? "1px dashed #cbd5e1" : "none", paddingBottom: 8 }}>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                                          <span className="admin-sc-badge evaluated" style={{ fontSize: 11, padding: "3px 6px", display: "inline-block", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                                            Judge {idx + 1} ({ev.judgeId.split("@")[0]}): ⭐ {ev.totalScore}/25
                                          </span>
                                        </div>
                                        {ev.remarks && (
                                          <div style={{ fontStyle: "italic", color: "#475569", marginTop: 4, paddingLeft: "8px", borderLeft: "2px solid #cbd5e1" }}>
                                            "{ev.remarks}"
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "2px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", fontSize: 13, color: "var(--sc-navy)" }}>
                                      <span>Average Score:</span>
                                      <span style={{ color: "#2563eb" }}>⭐ {sub.totalScore !== undefined && sub.totalScore !== null ? sub.totalScore : (Math.round(sub.evaluations.reduce((acc, ev) => acc + (ev.totalScore || 0), 0) / sub.evaluations.length * 10) / 10)} / 25</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : sub.totalScore !== undefined && sub.totalScore !== null ? (
                              <div>
                                <span
                                  className="admin-sc-badge evaluated"
                                  style={{ fontSize: 12 }}
                                >
                                  ⭐ {sub.totalScore} / 25 Marks
                                </span>
                                {sub.judgeRemarks && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "var(--sc-slate)",
                                      marginTop: 4,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    "{sub.judgeRemarks}"
                                  </div>
                                )}
                              </div>
                            ) : sub.status === "COMPLETED" ? (
                              <span
                                className="admin-sc-badge evaluated"
                                style={{ fontSize: 12 }}
                              >
                                ✓ Evaluated
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "var(--sc-slate-soft)",
                                  fontSize: 12,
                                  fontStyle: "italic",
                                }}
                              >
                                Not Graded Yet
                              </span>
                            )}
                          </td>
                          <td>
                            {sub.status === "REJECTED" ? (
                              <div>
                                <span
                                  className="admin-sc-badge rejected"
                                  style={{
                                    display: "inline-block",
                                    marginBottom: 4,
                                  }}
                                >
                                  🚫 REJECTED
                                </span>
                                {sub.rejectionReason && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "var(--sc-red-text)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Reason: {sub.rejectionReason}
                                  </div>
                                )}
                                {sub.rejectedBy && (
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--sc-slate)",
                                    }}
                                  >
                                    By: {sub.rejectedBy}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                className="admin-sc-btn admin-sc-btn-danger"
                                onClick={() =>
                                  handleOpenRejectModal(sub.submissionId)
                                }
                                title="Reject Student Submission"
                                style={{ fontSize: 12 }}
                              >
                                🚫 Reject
                              </button>
                            )}
                          </td>
                          <td>
                            {sub.status === "REJECTED" ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--sc-slate-soft)",
                                  fontStyle: "italic",
                                }}
                              >
                                Not Eligible (Rejected)
                              </span>
                            ) : (
                              (() => {
                                const comp = competitions.find(
                                  (c) => c.competitionId === sub.competitionId,
                                );
                                const mode = comp
                                  ? comp.winnerAnnouncementMode
                                  : "AUTOMATIC";
                                const isManualMode =
                                  mode === "MANUAL" || mode === "CHOICE";
                                const isAutomaticMode =
                                  mode === "AUTOMATIC" || mode === "AUTO";

                                if (isAutomaticMode) {
                                  const autoRank = getAutoWinnerRank(sub);
                                  if (autoRank) {
                                    const badges = {
                                      1: "🥇 1st (Auto)",
                                      2: "🥈 2nd (Auto)",
                                      3: "🥉 3rd (Auto)",
                                    };
                                    return (
                                      <div>
                                        <span className={`admin-sc-badge winner rank-${autoRank}`} style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "12px", fontWeight: "bold" }}>
                                          {badges[autoRank]}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div>
                                      <span
                                        className="admin-sc-meta-chip"
                                        style={{
                                          fontStyle: "italic",
                                          fontSize: 11,
                                          whiteSpace: "nowrap",
                                          display: "inline-block",
                                        }}
                                      >
                                        🤖 Auto (No Rank)
                                      </span>
                                    </div>
                                  );
                                }

                                const takenRanks = submissions
                                  .filter(s => 
                                    s.competitionId === sub.competitionId && 
                                    s.groupCategory === sub.groupCategory && 
                                    s.submissionId !== sub.submissionId && 
                                    s.winnerRank !== null && 
                                    s.winnerRank !== undefined
                                  )
                                  .map(s => String(s.winnerRank));

                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 4,
                                    }}
                                  >
                                    {isManualMode && !sub.winnerRank && (
                                      <span style={{ 
                                        display: "inline-block", 
                                        padding: "4px 8px", 
                                        borderRadius: "6px", 
                                        background: "linear-gradient(135deg, #f59e0b, #d97706)", 
                                        color: "white", 
                                        fontSize: "10px", 
                                        fontWeight: "700", 
                                        letterSpacing: "0.5px",
                                        boxShadow: "0 2px 4px rgba(245, 158, 11, 0.2)",
                                        marginBottom: "4px",
                                        textAlign: "center"
                                      }}>
                                        ⚡ SELECT WINNER
                                      </span>
                                    )}
                                    <select
                                      className={`admin-sc-medal-select ${rankClass(sub, isManualMode)}`}
                                      value={sub.winnerRank || ""}
                                      onChange={(e) =>
                                        handleAnnounceWinner(
                                          sub.submissionId,
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">
                                        -- Choose Winner --
                                      </option>
                                      {(!takenRanks.includes("1") || String(sub.winnerRank) === "1") && (
                                        <option value="1">
                                          🥇 1st Place Winner
                                        </option>
                                      )}
                                      {(!takenRanks.includes("2") || String(sub.winnerRank) === "2") && (
                                        <option value="2">
                                          🥈 2nd Place Winner
                                        </option>
                                      )}
                                      {(!takenRanks.includes("3") || String(sub.winnerRank) === "3") && (
                                        <option value="3">
                                          🥉 3rd Place Winner
                                        </option>
                                      )}
                                    </select>
                                  </div>
                                );
                              })()
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: "var(--sc-slate)", fontWeight: "600" }}>
                      Showing {startIndex + 1} to {Math.min(startIndex + subPageSize, totalSubmissions)} of {totalSubmissions} submissions
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        disabled={activePage === 1}
                        onClick={() => setSubPage((prev) => Math.max(prev - 1, 1))}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: activePage === 1 ? "#f1f5f9" : "#fff",
                          color: activePage === 1 ? "#94a3b8" : "var(--sc-navy)",
                          cursor: activePage === 1 ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "13px"
                        }}
                      >
                        ◀ Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setSubPage(pageNum)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: pageNum === activePage ? "1px solid #2563eb" : "1px solid #cbd5e1",
                            backgroundColor: pageNum === activePage ? "#2563eb" : "#fff",
                            color: pageNum === activePage ? "#fff" : "#334155",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={activePage === totalPages}
                        onClick={() => setSubPage((prev) => Math.min(prev + 1, totalPages))}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: activePage === totalPages ? "#f1f5f9" : "#fff",
                          color: activePage === totalPages ? "#94a3b8" : "var(--sc-navy)",
                          cursor: activePage === totalPages ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "13px"
                        }}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
          </div>
        )}

        {/* PLAYING MEDIA MODAL (YOUTUBE / DIRECT VIDEO / IMAGE PREVIEW) */}
        {playingVideoUrl && (
          <div
            className="admin-sc-modal-overlay"
            style={{ backgroundColor: "rgba(10,14,24,0.9)", zIndex: 2000 }}
            onClick={() => setPlayingVideoUrl(null)}
          >
            <div
              className="admin-sc-video-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-sc-video-modal-header">
                <span>
                  {(!playingVideoUrl.startsWith("http") && !playingVideoUrl.startsWith("data:")) ? "📝 Source Code Preview" : (playingVideoUrl.startsWith("data:") && !playingVideoUrl.startsWith("data:image") && !playingVideoUrl.startsWith("data:video")) ? "📄 Document File Submission" : "▶ Video Submission Preview"}
                </span>
                <button
                  className="admin-sc-btn admin-sc-btn-danger solid"
                  onClick={() => setPlayingVideoUrl(null)}
                  style={{ borderRadius: 8, padding: "6px 14px" }}
                >
                  Close ✕
                </button>
              </div>

              {(!playingVideoUrl.startsWith("http") && !playingVideoUrl.startsWith("data:")) ? (
                <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", maxHeight: "450px", overflowY: "auto", textAlign: "left" }}>
                  <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "14px", whiteSpace: "pre-wrap", color: "#334155", lineHeight: "1.5" }}>
                    {playingVideoUrl}
                  </pre>
                </div>
              ) : (playingVideoUrl.startsWith("data:") && !playingVideoUrl.startsWith("data:image") && !playingVideoUrl.startsWith("data:video")) ? (
                <div style={{ textAlign: "center", padding: "30px 10px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "15px" }}>📄</div>
                  <h4 style={{ color: "#0f172a", marginBottom: "20px" }}>Document File Submission (.pdf, .csv, .txt, .json, .docx, .xlsx, etc.)</h4>
                  <a
                    href={playingVideoUrl}
                    download="kojo_submission_file"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#2563eb",
                      color: "white",
                      padding: "12px 30px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      textDecoration: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    📥 Download Submission File
                  </a>
                </div>
              ) : (playingVideoUrl.startsWith("data:image") || playingVideoUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|heic)$/i)) ? (
                <div style={{ textAlign: "center", backgroundColor: "#0f172a", padding: 10, borderRadius: 8 }}>
                  <img
                    src={playingVideoUrl}
                    alt="Submission Preview"
                    style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain", borderRadius: 6 }}
                  />
                </div>
              ) : (getEmbedUrl(playingVideoUrl) && getEmbedUrl(playingVideoUrl).startsWith("https://www.youtube.com/embed/")) ? (
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: 10,
                  }}
                >
                  <iframe
                    src={getEmbedUrl(playingVideoUrl)}
                    title="Video Player"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <AsyncVideoPlayer videoUrl={playingVideoUrl} />
              )}
            </div>
          </div>
        )}
        {showModal && (
          <div className="admin-sc-modal-overlay" style={{ paddingTop: "100px", paddingBottom: "40px", alignItems: "flex-start", overflowY: "auto" }}>
            <div className="admin-sc-modal hide-scrollbar">
              <button
                type="button"
                className="rotate-close-btn"
                onClick={handleCloseCreate}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: -18,
                  float: "right",
                  marginTop: -20,
                  marginRight: -24,
                  zIndex: 20,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(20,29,51,0.3)",
                }}
              >
                ✕
              </button>

              <h3 className="admin-sc-modal-title">
                ➕ Create New School Competition
              </h3>
              <form
                onSubmit={handleCreateCompetition}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label className="admin-sc-field-label">Category *</label>
                  <select
                    className="admin-sc-filter-select"
                    value={isCreatingCustomCategory ? "ADD_NEW" : newComp.category}
                    onChange={(e) => {
                      if (e.target.value === "ADD_NEW") {
                        setIsCreatingCustomCategory(true);
                        setNewComp({ ...newComp, category: "" });
                      } else {
                        setIsCreatingCustomCategory(false);
                        setNewComp({ ...newComp, category: e.target.value });
                      }
                    }}
                    style={{ width: "100%", backgroundColor: "#fff" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="ADD_NEW">+ Add New Category</option>
                  </select>
                  {isCreatingCustomCategory && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label className="admin-sc-field-label">New Category Name *</label>
                        <input
                          type="text"
                          className="admin-sc-input"
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="e.g. Art, Drawing, Essay Writing, etc."
                          style={{ width: "100%" }}
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-sc-btn admin-sc-btn-primary"
                        onClick={() => {
                          const val = customCategoryName.trim();
                          if (val) {
                            if (!categories.includes(val)) {
                              setCategories([...categories, val]);
                            }
                            setNewComp({ ...newComp, category: val });
                            setIsCreatingCustomCategory(false);
                            setCustomCategoryName("");
                          } else {
                            alert("Please enter a valid category name.");
                          }
                        }}
                        style={{ padding: "10px 16px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Competition ID * (e.g. COMP-2026-AUG-001)
                  </label>
                  <input
                    className="admin-sc-input admin-sc-id-input"
                    required
                    type="text"
                    value={newComp.competitionId}
                    onChange={(e) =>
                      setNewComp({ ...newComp, competitionId: e.target.value })
                    }
                    placeholder="COMP-2026-AUG-001"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Competition Title *
                  </label>
                  <input
                    className="admin-sc-input"
                    required
                    type="text"
                    value={newComp.title}
                    onChange={(e) =>
                      setNewComp({ ...newComp, title: e.target.value })
                    }
                    placeholder="e.g. Public Speaking Competition"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">Description</label>
                  <textarea
                    className="admin-sc-textarea"
                    rows="3"
                    value={newComp.description}
                    onChange={(e) =>
                      setNewComp({ ...newComp, description: e.target.value })
                    }
                    placeholder="Enter competition guidelines"
                    style={{ width: "100%" }}
                  />
                </div>

                {/* SELECT PARTICIPATING SCHOOLS FROM SCHOOL LIST */}
                <div className="admin-sc-form-section">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--sc-ink)",
                      }}
                    >
                      Select Participating Schools
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSchoolModal(true)}
                      style={{
                        fontSize: 12,
                        color: "var(--sc-navy)",
                        fontWeight: 700,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      + Manage / Add Schools
                    </button>
                  </div>

                  {(() => {
                    const availableSchools = masterSchools.filter(
                      (sch) => !schoolList.includes(sch.name),
                    );
                    
                    return (
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px", maxHeight: "300px", overflowY: "auto", backgroundColor: "#fff" }}>
                        {availableSchools.length > 0 ? (
                          <>
                            <div style={{ padding: "4px 0", borderBottom: "1px solid #e2e8f0", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <input 
                                type="checkbox" 
                                id="selectAllSchools"
                                checked={false}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSchoolList(masterSchools.map((s) => s.name));
                                  }
                                }}
                                style={{ cursor: "pointer", width: "16px", height: "16px" }}
                              />
                              <label htmlFor="selectAllSchools" style={{ fontWeight: "700", color: "var(--sc-green)", cursor: "pointer", fontSize: "13px" }}>
                                Select All Remaining ({availableSchools.length})
                              </label>
                            </div>
                            {availableSchools.map((sch) => (
                              <div key={sch.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                                <input 
                                  type="checkbox"
                                  id={`school_${sch.id}`}
                                  checked={false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSchoolList([...schoolList, sch.name]);
                                    }
                                  }}
                                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                                <label htmlFor={`school_${sch.id}`} style={{ cursor: "pointer", fontSize: "13px", color: "var(--sc-navy)", flex: 1 }}>
                                  {sch.name}
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div style={{ fontSize: "13px", color: "var(--sc-slate)", textAlign: "center", padding: "10px 0" }}>
                            All schools are selected!
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Selected School Chips */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--sc-navy)" }}>Selected Schools ({schoolList.length})</span>
                      {schoolList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSchoolList([])}
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {schoolList.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {schoolList.map((s, idx) => (
                          <span key={idx} className="admin-sc-chip">
                            {s}
                            <button
                              type="button"
                              className="admin-sc-chip-remove"
                              onClick={() => handleRemoveSchool(s)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--sc-slate)",
                          display: "block",
                        }}
                      >
                        No schools selected yet. Choose schools from list above.
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label className="admin-sc-field-label">Start Date *</label>
                    <input
                      className="admin-sc-input"
                      required
                      type="date"
                      value={newComp.startDate}
                      onChange={(e) =>
                        setNewComp({ ...newComp, startDate: e.target.value })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div>
                    <label className="admin-sc-field-label">End Date *</label>
                    <input
                      className="admin-sc-input"
                      required
                      type="date"
                      value={newComp.endDate}
                      onChange={(e) =>
                        setNewComp({ ...newComp, endDate: e.target.value })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Single Shared School Verification Code *
                  </label>
                  <input
                    className="admin-sc-input admin-sc-code-input"
                    required
                    type="text"
                    value={newComp.verificationCode}
                    onChange={(e) =>
                      setNewComp({
                        ...newComp,
                        verificationCode: e.target.value,
                      })
                    }
                    placeholder="e.g. SG-SCHOOL-2026"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Winner Announcement Mode
                  </label>
                  <select
                    className="admin-sc-filter-select"
                    value={newComp.winnerAnnouncementMode}
                    onChange={(e) =>
                      setNewComp({
                        ...newComp,
                        winnerAnnouncementMode: e.target.value,
                      })
                    }
                    style={{ width: "100%", backgroundColor: "#fff" }}
                  >
                    <option value="AUTOMATIC">
                      AUTOMATIC (Auto-rank top 3)
                    </option>
                    <option value="MANUAL">
                      MANUAL (Admin manual trigger)
                    </option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="admin-sc-btn admin-sc-btn-ghost"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-sc-btn admin-sc-btn-primary"
                    style={{ flex: 1, padding: 13 }}
                  >
                    Create Competition
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT COMPETITION MODAL */}
        {showEditModal && editingComp && (
          <div className="admin-sc-modal-overlay">
            <div className="admin-sc-modal accent-amber hide-scrollbar">
              <button
                type="button"
                className="rotate-close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingComp(null);
                  setSchoolList([]);
                  setIsEditingCustomCategory(false);
                  setEditCustomCategoryName("");
                }}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: -18,
                  float: "right",
                  marginTop: -20,
                  marginRight: -24,
                  zIndex: 20,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(20,29,51,0.3)",
                }}
              >
                ✕
              </button>

              <h3 className="admin-sc-modal-title">
                ✏️ Edit School Competition
              </h3>
              <form
                onSubmit={handleUpdateCompetition}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label className="admin-sc-field-label">Category *</label>
                  <select
                    className="admin-sc-filter-select"
                    value={isEditingCustomCategory ? "ADD_NEW" : editingComp.category}
                    onChange={(e) => {
                      if (e.target.value === "ADD_NEW") {
                        setIsEditingCustomCategory(true);
                        setEditingComp({ ...editingComp, category: "" });
                      } else {
                        setIsEditingCustomCategory(false);
                        setEditingComp({ ...editingComp, category: e.target.value });
                      }
                    }}
                    style={{ width: "100%", backgroundColor: "#fff" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {editingComp.category && !categories.includes(editingComp.category) && (
                      <option value={editingComp.category}>{editingComp.category}</option>
                    )}
                    <option value="ADD_NEW">+ Add New Category</option>
                  </select>
                  {isEditingCustomCategory && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <label className="admin-sc-field-label">New Category Name *</label>
                        <input
                          type="text"
                          className="admin-sc-input"
                          value={editCustomCategoryName}
                          onChange={(e) => setEditCustomCategoryName(e.target.value)}
                          placeholder="e.g. Art, Drawing, Essay Writing, etc."
                          style={{ width: "100%" }}
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-sc-btn admin-sc-btn-primary"
                        onClick={() => {
                          const val = editCustomCategoryName.trim();
                          if (val) {
                            if (!categories.includes(val)) {
                              setCategories([...categories, val]);
                            }
                            setEditingComp({ ...editingComp, category: val });
                            setIsEditingCustomCategory(false);
                            setEditCustomCategoryName("");
                          } else {
                            alert("Please enter a valid category name.");
                          }
                        }}
                        style={{ padding: "10px 16px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Competition ID (Read Only)
                  </label>
                  <input
                    disabled
                    type="text"
                    value={editingComp.competitionId}
                    className="admin-sc-id-input"
                    style={{
                      width: "100%",
                      padding: 11,
                      borderRadius: 8,
                      border: "1px solid var(--sc-border)",
                      backgroundColor: "var(--sc-paper)",
                      color: "var(--sc-slate)",
                    }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Competition Title *
                  </label>
                  <input
                    className="admin-sc-input"
                    required
                    type="text"
                    value={editingComp.title}
                    onChange={(e) =>
                      setEditingComp({ ...editingComp, title: e.target.value })
                    }
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">Description</label>
                  <textarea
                    className="admin-sc-textarea"
                    rows="3"
                    value={editingComp.description}
                    onChange={(e) =>
                      setEditingComp({
                        ...editingComp,
                        description: e.target.value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </div>

                {/* EDIT PARTICIPATING SCHOOLS SECTION WITH MASTER LIST DROPDOWN */}
                <div className="admin-sc-form-section">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--sc-ink)",
                      }}
                    >
                      Participating Schools
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSchoolModal(true)}
                      style={{
                        fontSize: 12,
                        color: "var(--sc-navy)",
                        fontWeight: 700,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      + Manage / Add Schools
                    </button>
                  </div>

                  {(() => {
                    const availableSchools = masterSchools.filter(
                      (sch) => !schoolList.includes(sch.name),
                    );
                    return (
                      <select
                        className="admin-sc-filter-select"
                        style={{ width: "100%", backgroundColor: "#fff" }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "ADD_ALL") {
                            const allNames = masterSchools.map((s) => s.name);
                            setSchoolList(
                              Array.from(new Set([...schoolList, ...allNames])),
                            );
                          } else if (val && !schoolList.includes(val)) {
                            setSchoolList([...schoolList, val]);
                          }
                        }}
                        value=""
                      >
                        <option value="">
                          -- Add School ({availableSchools.length} Remaining /
                          Available) --
                        </option>
                        {availableSchools.length > 0 && (
                          <option
                            value="ADD_ALL"
                            style={{
                              fontWeight: 700,
                              color: "var(--sc-green)",
                            }}
                          >
                            ➕ Add All Schools ({availableSchools.length}{" "}
                            Schools)
                          </option>
                        )}
                        {availableSchools.map((sch) => (
                          <option key={sch.id} value={sch.name}>
                            {sch.name}
                          </option>
                        ))}
                      </select>
                    );
                  })()}

                  {/* School List Display */}
                  {schoolList.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      {schoolList.map((s, idx) => (
                        <span key={idx} className="admin-sc-chip">
                          {s}
                          <button
                            type="button"
                            className="admin-sc-chip-remove"
                            onClick={() => handleRemoveSchool(s)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--sc-slate)",
                        marginTop: 6,
                        display: "block",
                      }}
                    >
                      No participating schools selected.
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label className="admin-sc-field-label">
                      Start Date (Fixed)
                    </label>
                    <input
                      disabled
                      className="admin-sc-input"
                      type="date"
                      value={editingComp.startDate}
                      style={{
                        width: "100%",
                        backgroundColor: "var(--sc-paper)",
                        color: "var(--sc-slate)",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-sc-field-label">
                      End Date *
                    </label>
                    <input
                      className="admin-sc-input"
                      type="date"
                      value={editingComp.endDate}
                      onChange={(e) => setEditingComp({ ...editingComp, endDate: e.target.value })}
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Single Shared School Verification Code *
                  </label>
                  <input
                    className="admin-sc-input admin-sc-code-input"
                    required
                    type="text"
                    value={editingComp.verificationCode}
                    onChange={(e) =>
                      setEditingComp({
                        ...editingComp,
                        verificationCode: e.target.value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label className="admin-sc-field-label">
                    Winner Announcement Mode
                  </label>
                  <select
                    className="admin-sc-filter-select"
                    value={editingComp.winnerAnnouncementMode}
                    onChange={(e) =>
                      setEditingComp({
                        ...editingComp,
                        winnerAnnouncementMode: e.target.value,
                      })
                    }
                    style={{ width: "100%", backgroundColor: "#fff" }}
                  >
                    <option value="AUTOMATIC">
                      AUTOMATIC (Auto-rank top 3)
                    </option>
                    <option value="MANUAL">
                      MANUAL (Admin manual trigger)
                    </option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="admin-sc-btn admin-sc-btn-ghost"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingComp(null);
                      setSchoolList([]);
                      setIsEditingCustomCategory(false);
                      setEditCustomCategoryName("");
                    }}
                    style={{ flex: 1, padding: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-sc-btn admin-sc-btn-accent"
                    style={{ flex: 1, padding: 13 }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* MASTER SCHOOL MANAGEMENT MODAL */}
        {showSchoolModal && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 1100 }}>
            <div
              className="admin-sc-modal accent-green hide-scrollbar"
              style={{ maxWidth: 900 }}
            >
              <button
                type="button"
                className="rotate-close-btn"
                onClick={() => {
                  setShowSchoolModal(false);
                  setEditingSchool(null);
                  setMasterSchoolInput({ name: "", address: "", code: "" });
                }}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: -18,
                  float: "right",
                  marginTop: -20,
                  marginRight: -24,
                  zIndex: 20,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(20,29,51,0.3)",
                }}
              >
                ✕
              </button>

              <h3 className="admin-sc-modal-title">
                🏫 Central Schools Management
              </h3>

              {/* Input Mode Selector */}
              <div className="admin-sc-segmented">
                <button
                  type="button"
                  className={`admin-sc-segmented-btn ${masterSchoolInputMode === "MANUAL" ? "active" : ""}`}
                  onClick={() => setMasterSchoolInputMode("MANUAL")}
                >
                  + Add / Edit School
                </button>
                <button
                  type="button"
                  className={`admin-sc-segmented-btn ${masterSchoolInputMode === "FILE" ? "active" : ""}`}
                  onClick={() => setMasterSchoolInputMode("FILE")}
                >
                  📁 Bulk Upload
                </button>
              </div>

              {/* Single School Form */}
              {masterSchoolInputMode === "MANUAL" && (
                <form
                  onSubmit={handleAddMasterSchoolSingle}
                  className="admin-sc-form-section"
                  style={{ marginBottom: 20 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <label className="admin-sc-field-label">
                        School Name *
                      </label>
                      <input
                        className="admin-sc-input"
                        required
                        type="text"
                        value={masterSchoolInput.name}
                        onChange={(e) =>
                          setMasterSchoolInput({
                            ...masterSchoolInput,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter exact school name"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label className="admin-sc-field-label">
                        School Code (Optional)
                      </label>
                      <input
                        className="admin-sc-input admin-sc-code-input"
                        type="text"
                        value={masterSchoolInput.code}
                        onChange={(e) =>
                          setMasterSchoolInput({
                            ...masterSchoolInput,
                            code: e.target.value,
                          })
                        }
                        placeholder="e.g. SCH-01"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="submit"
                      className="admin-sc-btn admin-sc-btn-success"
                    >
                      {editingSchool
                        ? "✓ Update School"
                        : "+ Add School to Master List"}
                    </button>
                    {editingSchool && (
                      <button
                        type="button"
                        className="admin-sc-btn admin-sc-btn-ghost"
                        onClick={() => {
                          setEditingSchool(null);
                          setMasterSchoolInput({
                            name: "",
                            address: "",
                            code: "",
                          });
                        }}
                        style={{ padding: "11px 18px" }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Bulk XLS Upload Mode */}
              {masterSchoolInputMode === "FILE" && (
                <div
                  className="admin-sc-form-section"
                  style={{ marginBottom: 20 }}
                >
                  <label
                    className="admin-sc-field-label"
                    style={{
                      textTransform: "none",
                      letterSpacing: "normal",
                      fontSize: 13,
                    }}
                  >
                    Select Excel / CSV / Doc File to Bulk Add Schools
                  </label>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv, .pdf, .doc, .docx"
                      onChange={handleMasterFileChange}
                      style={{
                        flex: 1,
                        padding: 10,
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        border: "1px solid var(--sc-border-strong)",
                      }}
                    />
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-primary"
                      onClick={handleProcessMasterFileUpload}
                      style={{ padding: "11px 24px", whiteSpace: "nowrap" }}
                    >
                      📤 Upload &amp; Process
                    </button>
                  </div>
                  {selectedBulkFile && (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--sc-green-text)",
                        fontWeight: 600,
                        display: "block",
                        marginTop: 8,
                      }}
                    >
                      ✓ Selected File: {selectedBulkFile.name} (Click "Upload
                      &amp; Process" above to add schools)
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--sc-slate)",
                      marginTop: 8,
                      display: "block",
                    }}
                  >
                    All clean school names from the uploaded file will be added
                    directly into the Central Schools Database.
                  </span>
                </div>
              )}

              {/* Master Schools Table */}
              <h4
                style={{
                  fontFamily: "var(--sc-font-display)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 14,
                  color: "var(--sc-ink)",
                }}
              >
                Master Schools Database ({masterSchools.length} Schools)
              </h4>
              {masterSchools.length === 0 ? (
                <p className="admin-sc-empty-note" style={{ padding: 0 }}>
                  No schools in master list. Add school manually or upload Excel
                  file above.
                </p>
              ) : (
                <div
                  className="admin-sc-scroll-thin"
                  style={{
                    maxHeight: 300,
                    overflowY: "auto",
                    border: "1px solid var(--sc-border)",
                    borderRadius: 10,
                  }}
                >
                  <table className="admin-sc-table">
                    <thead>
                      <tr style={{ position: "sticky", top: 0 }}>
                        <th>#</th>
                        <th>School Name</th>
                        <th>Code</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterSchools.map((sch, idx) => (
                        <tr key={sch.id}>
                          <td
                            style={{
                              fontWeight: 600,
                              color: "var(--sc-slate)",
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            style={{ fontWeight: 700, color: "var(--sc-ink)" }}
                          >
                            {sch.name}
                          </td>
                          <td
                            className="admin-sc-stamp"
                            style={{ color: "var(--sc-navy)" }}
                          >
                            {sch.code || "-"}
                          </td>
                          <td style={{ display: "flex", gap: 8 }}>
                            <button
                              className="admin-sc-btn admin-sc-btn-warning"
                              onClick={() => {
                                setEditingSchool(sch);
                                setMasterSchoolInput({
                                  name: sch.name,
                                  address: sch.address || "",
                                  code: sch.code || "",
                                });
                                setMasterSchoolInputMode("MANUAL");
                              }}
                              style={{ fontSize: 12 }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="admin-sc-btn admin-sc-btn-danger"
                              onClick={() =>
                                handleDeleteMasterSchool(sch.id, sch.name)
                              }
                              style={{ fontSize: 12 }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* PRIZE DISTRIBUTION VIDEO MODAL — Add Video URL / Edit Information tabs */}
        {showPrizeModal && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 1150 }}>
            <div
              className="admin-sc-modal accent-amber hide-scrollbar"
              style={{ maxWidth: 850 }}
            >
              <button
                type="button"
                className="rotate-close-btn"
                onClick={handleClosePrizeModal}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: -18,
                  float: "right",
                  marginTop: -20,
                  marginRight: -24,
                  zIndex: 20,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(20,29,51,0.3)",
                }}
              >
                ✕
              </button>

              <h3 className="admin-sc-modal-title">
                🎬 Prize Distribution Video
              </h3>

              {/* Tab Selector */}
              <div className="admin-sc-segmented" style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  className={`admin-sc-segmented-btn ${prizeModalTab === "ADD" ? "active" : ""}`}
                  onClick={() => setPrizeModalTab("ADD")}
                >
                  + Add Video URL
                </button>
                <button
                  type="button"
                  className={`admin-sc-segmented-btn ${prizeModalTab === "EDIT" ? "active" : ""}`}
                  onClick={() => setPrizeModalTab("EDIT")}
                >
                  ✏️ Edit Information ({prizeVideos.length})
                </button>
              </div>

              {/* TAB 1: ADD VIDEO URL */}
              {prizeModalTab === "ADD" && (
                <form
                  onSubmit={handleSubmitPrizeVideo}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <label className="admin-sc-field-label">
                      Competition ID *
                    </label>
                    <select
                      className="admin-sc-filter-select"
                      required
                      value={prizeVideoForm.competitionId}
                      onChange={(e) =>
                        handleSelectPrizeCompetition(e.target.value)
                      }
                      style={{ width: "100%", backgroundColor: "#fff" }}
                    >
                      <option value="">-- Select Competition --</option>
                      {competitions.map((c) => (
                        <option key={c.competitionId} value={c.competitionId}>
                          {c.competitionId} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="admin-sc-field-label">
                      Competition Name
                    </label>
                    <input
                      className="admin-sc-input"
                      type="text"
                      value={prizeVideoForm.competitionName}
                      readOnly
                      placeholder="Auto-filled from Competition ID"
                      style={{
                        width: "100%",
                        backgroundColor: "var(--sc-paper)",
                        color: "var(--sc-slate)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label className="admin-sc-field-label">Category</label>
                      <input
                        className="admin-sc-input"
                        type="text"
                        value={prizeVideoForm.category}
                        readOnly
                        placeholder="Auto-filled from Competition ID"
                        style={{
                          width: "100%",
                          backgroundColor: "var(--sc-paper)",
                          color: "var(--sc-slate)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="admin-sc-field-label">
                        Start – End Date
                      </label>
                      <input
                        className="admin-sc-input"
                        type="text"
                        value={
                          prizeVideoForm.startDate || prizeVideoForm.endDate
                            ? `${prizeVideoForm.startDate || "—"}  →  ${prizeVideoForm.endDate || "—"}`
                            : ""
                        }
                        readOnly
                        placeholder="Auto-filled from Competition ID"
                        style={{
                          width: "100%",
                          backgroundColor: "var(--sc-paper)",
                          color: "var(--sc-slate)",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-sc-field-label">
                      Prize Distribution Video URL *
                    </label>
                    <input
                      className="admin-sc-input"
                      required
                      type="text"
                      value={prizeVideoForm.videoUrl}
                      onChange={(e) =>
                        setPrizeVideoForm({
                          ...prizeVideoForm,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="Paste YouTube link..."
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-ghost"
                      onClick={handleClosePrizeModal}
                      style={{ flex: 1, padding: 13 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-sc-btn admin-sc-btn-accent"
                      style={{ flex: 1, padding: 13 }}
                    >
                      {editingPrizeVideoId ? "✓ Update Video" : "+ Add Video"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: EDIT INFORMATION */}
              {prizeModalTab === "EDIT" && (
                <div>
                  {prizeVideosLoading ? (
                    <p className="admin-sc-empty-note" style={{ padding: "20px 0" }}>
                      Loading prize distribution videos...
                    </p>
                  ) : prizeVideos.length === 0 ? (
                    <p
                      className="admin-sc-empty-note"
                      style={{ padding: "20px 0" }}
                    >
                      No prize distribution videos uploaded yet. Switch to "Add
                      Video URL" to add one.
                    </p>
                  ) : (
                    <div
                      className="admin-sc-scroll-thin"
                      style={{
                        maxHeight: 340,
                        overflowY: "auto",
                        border: "1px solid var(--sc-border)",
                        borderRadius: 10,
                      }}
                    >
                      <table className="admin-sc-table">
                        <thead>
                          <tr>
                            <th>Competition ID</th>
                            <th>Competition Name</th>
                            <th>Category</th>
                            <th>Dates</th>
                            <th>Video</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prizeVideos.map((v) => (
                            <tr key={v.id}>
                              <td className="id-cell nowrap-cell">
                                {v.competitionId}
                              </td>
                              <td className="wrap-cell">{v.competitionName}</td>
                              <td className="nowrap-cell">{v.category}</td>
                              <td className="nowrap-cell" style={{ fontSize: 12 }}>
                                {toDateInputValue(v.startDate) || "—"} →{" "}
                                {toDateInputValue(v.endDate) || "—"}
                              </td>
                              <td className="nowrap-cell">
                                <button
                                  className="admin-sc-btn-play"
                                  onClick={() => setPlayingVideoUrl(v.videoUrl)}
                                >
                                  ▶ Play Video
                                </button>
                              </td>
                              <td
                                className="nowrap-cell"
                                style={{ display: "flex", gap: 8 }}
                              >
                                <button
                                  className="admin-sc-btn admin-sc-btn-warning"
                                  onClick={() => handleEditPrizeVideo(v)}
                                  style={{ fontSize: 12 }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="admin-sc-btn admin-sc-btn-danger"
                                  onClick={() => handleDeletePrizeVideo(v.id)}
                                  style={{ fontSize: 12 }}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 18,
                    }}
                  >
                    <button
                      type="button"
                      className="admin-sc-btn admin-sc-btn-ghost"
                      onClick={handleClosePrizeModal}
                      style={{ padding: "10px 24px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* REJECT SUBMISSION MODAL WITH REASON PROMPT */}
        {showRejectModal && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 1200 }}>
            <div
              className="admin-sc-modal accent-red"
              style={{ maxWidth: 520, padding: "28px 32px" }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 12,
                  fontFamily: "var(--sc-font-display)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--sc-red-text)",
                }}
              >
                🚫 Reject Student Submission{" "}
                <span
                  className="admin-sc-stamp"
                  style={{ color: "var(--sc-red-text)", fontSize: 14 }}
                >
                  ({rejectingSubmissionId})
                </span>
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--sc-ink-soft)",
                  marginBottom: 18,
                }}
              >
                Please specify the mandatory reason for rejecting this student
                submission. This will be recorded for audit purposes.
              </p>

              <form onSubmit={handleConfirmRejectSubmission}>
                <div style={{ marginBottom: 22 }}>
                  <label className="admin-sc-field-label">
                    Rejection Reason *
                  </label>
                  <textarea
                    className="admin-sc-textarea"
                    required
                    rows="4"
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Enter clear rejection reason (e.g. Invalid Video URL, Off-topic content, Incorrect School code...)"
                    style={{ width: "100%", borderRadius: 10 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="admin-sc-btn admin-sc-btn-ghost"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectingSubmissionId("");
                      setRejectionReasonInput("");
                    }}
                    style={{ padding: "10px 20px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-sc-btn admin-sc-btn-danger solid"
                    style={{ padding: "10px 24px", borderRadius: 8 }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MANAGE CATEGORIES MODAL */}
        {isManageCategoriesModalOpen && (
          <div className="admin-sc-modal-overlay" style={{ zIndex: 1100 }}>
            <div className="admin-sc-modal" style={{ maxWidth: 640, width: "90%", padding: "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: "var(--sc-font-display)", fontSize: 22, fontWeight: 600, color: "var(--sc-navy)" }}>
                  🏷️ Manage Competition Categories
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsManageCategoriesModalOpen(false);
                    setEditingCategoryIndex(null);
                    setEditingCategoryValue("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 24,
                    color: "var(--sc-slate-soft)",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </div>

              <p style={{ fontSize: "14px", color: "var(--sc-slate)", marginBottom: 22 }}>
                You can edit (rename) or delete existing categories. Editing a category will update all active competitions under that category. Deleting a category will reset those competitions to "General".
              </p>

              <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid var(--sc-border)", borderRadius: "8px", marginBottom: "22px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--sc-border)" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Category Name</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", fontSize: "13px", fontWeight: "600", color: "#64748b", width: "160px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--sc-border)", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fdfdfd"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "600", color: "var(--sc-ink)" }}>
                          {editingCategoryIndex === idx ? (
                            <input
                              type="text"
                              className="admin-sc-input"
                              style={{ width: "100%", padding: "6px 10px", margin: 0, fontSize: "14px", borderRadius: "6px" }}
                              value={editingCategoryValue}
                              onChange={(e) => setEditingCategoryValue(e.target.value)}
                            />
                          ) : (
                            cat
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          {editingCategoryIndex === idx ? (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-accent solid"
                                style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "6px" }}
                                onClick={() => handleRenameCategory(cat, editingCategoryValue)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-ghost"
                                style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "6px" }}
                                onClick={() => {
                                  setEditingCategoryIndex(null);
                                  setEditingCategoryValue("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-warning"
                                style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "6px" }}
                                onClick={() => {
                                  setEditingCategoryIndex(idx);
                                  setEditingCategoryValue(cat);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="admin-sc-btn admin-sc-btn-danger"
                                style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "6px" }}
                                onClick={() => handleDeleteCategory(cat)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="admin-sc-btn admin-sc-btn-ghost"
                  style={{ padding: "10px 24px", borderRadius: "8px" }}
                  onClick={() => {
                    setIsManageCategoriesModalOpen(false);
                    setEditingCategoryIndex(null);
                    setEditingCategoryValue("");
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
