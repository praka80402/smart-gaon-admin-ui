import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import * as XLSX from "xlsx";
import "./adminSchoolCompetition.css";

export default function AdminCompetitionManager() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [masterSchools, setMasterSchools] = useState([]);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [masterSchoolInput, setMasterSchoolInput] = useState({ name: "", address: "", code: "" });
  const [masterSchoolInputMode, setMasterSchoolInputMode] = useState("MANUAL"); // MANUAL vs FILE

  useEffect(() => {
    fetchCompetitions();
    fetchSubmissions();
    fetchMasterSchools();
  }, []);

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
        const res = await axiosInstance.put(`/admin/school-competitions/schools/${editingSchool.id}`, masterSchoolInput);
        setMasterSchools(masterSchools.map(s => s.id === editingSchool.id ? res.data : s));
        setMsg(`✓ School '${res.data.name}' updated successfully!`);
      } else {
        const res = await axiosInstance.post("/admin/school-competitions/schools", masterSchoolInput);
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
    if (!window.confirm(`Are you sure you want to delete school '${name}'?`)) return;
    try {
      await axiosInstance.delete(`/admin/school-competitions/schools/${id}`);
      setMasterSchools(masterSchools.filter(s => s.id !== id));
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

        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
          const workbook = XLSX.read(buffer, { type: file.name.endsWith(".csv") ? "string" : "array" });
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
          const lines = String(buffer).split(/\r\n|\n/).map((l) => l.trim()).filter((l) => l.length > 2);
          parsedSchools = lines;
        }

        const uniqueSchools = Array.from(new Set(parsedSchools.map((s) => s.trim()))).filter(Boolean);

        if (uniqueSchools.length > 0) {
          const res = await axiosInstance.post("/admin/school-competitions/schools/bulk", uniqueSchools);
          fetchMasterSchools();
          setMsg(`✓ ${uniqueSchools.length} school names added to Central Schools List!`);
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
      const res = await axiosInstance.get("/admin/school-competitions/submissions");
      if (res.data && Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
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
    winnerAnnouncementMode: "AUTOMATIC",
  });

  const [msg, setMsg] = useState("");

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

        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
          const workbook = XLSX.read(buffer, { type: file.name.endsWith(".csv") ? "string" : "array" });
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
          const lines = String(buffer).split(/\r\n|\n/).map((l) => l.trim()).filter((l) => l.length > 2);
          parsedSchools = lines;
        }

        const uniqueSchools = Array.from(new Set(parsedSchools.map((s) => s.trim()))).filter(Boolean);

        if (uniqueSchools.length > 0) {
          setSchoolList((prev) => Array.from(new Set([...prev, ...uniqueSchools])));
          setMsg(`✓ ${uniqueSchools.length} school names extracted from '${file.name}'!`);
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
      const res = await axiosInstance.post("/admin/school-competitions", payload);
      setCompetitions((prev) => [...prev, res.data]);
      setMsg(`Competition '${newComp.title}' created successfully!`);
      setShowModal(false);
      setSchoolList([]);
      setUploadedFileName("");
      setNewComp({
        competitionId: "",
        title: "",
        description: "",
        category: "Public Speaking",
        verificationCode: "",
        winnerAnnouncementMode: "AUTOMATIC",
      });
    } catch (err) {
      console.error("Create Competition Error:", err);
      const serverErr = err.response?.data?.message || err.response?.data || err.message || "Failed to create competition on server.";
      alert(`⚠️ Create Competition Error: ${serverErr}`);
    }
  };

  const toggleLiveStatus = async (comp) => {
    try {
      const res = await axiosInstance.put(`/admin/school-competitions/${comp.competitionId}/toggle-live`);
      setCompetitions(competitions.map((c) => (c.competitionId === comp.competitionId ? res.data : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWinnerMode = async (comp) => {
    try {
      const res = await axiosInstance.put(`/admin/school-competitions/${comp.competitionId}/toggle-winner-mode`);
      setCompetitions(competitions.map((c) => (c.competitionId === comp.competitionId ? res.data : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const [editingComp, setEditingComp] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleOpenEdit = (comp) => {
    setEditingComp({
      competitionId: comp.competitionId,
      title: comp.title || "",
      description: comp.description || "",
      category: comp.category || "Public Speaking",
      startDate: comp.startDate || new Date().toISOString().split("T")[0],
      endDate: comp.endDate || "2026-08-31",
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
      const res = await axiosInstance.put(`/admin/school-competitions/${editingComp.competitionId}`, payload);
      setCompetitions(competitions.map((c) => (c.competitionId === editingComp.competitionId ? res.data : c)));
      setMsg(`Competition '${editingComp.title}' updated successfully!`);
      setShowEditModal(false);
      setEditingComp(null);
      setSchoolList([]);
    } catch (err) {
      console.error(err);
      alert("Failed to update competition.");
    }
  };

  const handleDeleteCompetition = async (comp) => {
    if (!comp.isLive || comp.status === "COMPLETED") {
      alert("⚠️ Over/Completed competitions cannot be deleted once completed or winners are announced!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete competition '${comp.title}'?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/school-competitions/${comp.competitionId}`);
      setCompetitions(competitions.filter((c) => c.competitionId !== comp.competitionId));
      setMsg(`Competition '${comp.title}' deleted successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to delete competition.");
    }
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
        { reason: rejectionReasonInput.trim() }
      );
      setSubmissions(submissions.map((s) => (s.submissionId === rejectingSubmissionId ? res.data : s)));
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
        { winnerRank: rankInt }
      );
      setSubmissions(submissions.map((s) => (s.submissionId === submissionId ? res.data : s)));
      if (rankInt) {
        const labels = { 1: "🥇 1st Place Winner", 2: "🥈 2nd Place Winner", 3: "🥉 3rd Place Winner" };
        setMsg(`✓ Submission '${submissionId}' announced as ${labels[rankInt]}!`);
      } else {
        setMsg(`Winner rank cleared for submission '${submissionId}'.`);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || "Failed to update winner rank.");
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
      winnerAnnouncementMode: "AUTOMATIC",
    });
    setShowModal(true);
  };

  const handleCloseCreate = () => {
    setShowModal(false);
    setSchoolList([]);
    setUploadedFileName("");
    setSchoolNameInput("");
  };

  const [activeTab, setActiveTab] = useState("active");
  const [submissions, setSubmissions] = useState([]);
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] = useState("NONE");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const handleDeleteSubmission = (subId) => {
    if (window.confirm(`Are you sure you want to delete submission '${subId}'?`)) {
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "20px 24px", borderRadius: "12px", marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>Admin School Competition Control Center</h2>
            <p style={{ margin: "6px 0 0 0", opacity: 0.8, fontSize: "14px" }}>
              Super Admin & State Admin: Manage Competitions, View All Student Submissions, Toggle Live Status, Set Winner Mode.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowSchoolModal(true)}
              style={{ padding: "12px 20px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
            >
              🏫 Manage Schools ({masterSchools.length})
            </button>
            <button
              onClick={handleOpenCreate}
              style={{ padding: "12px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
            >
              + Create New Competition
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION BAR FOR 3 COMPETITION TYPES */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => { setActiveTab("active"); setSelectedCompetitionFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "active" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "active" ? "#fff" : "#475569",
              boxShadow: activeTab === "active" ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
              transition: "all 0.2s"
            }}
          >
            🏆 Active Competitions ({competitions.filter((c) => (c.isLive === true || c.isLive === 1 || String(c.isLive) === "true") && c.status !== "COMPLETED").length})
          </button>

          <button
            onClick={() => { setActiveTab("upcoming"); setSelectedCompetitionFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "upcoming" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "upcoming" ? "#fff" : "#475569",
              boxShadow: activeTab === "upcoming" ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
              transition: "all 0.2s"
            }}
          >
            ⏳ Upcoming Competitions ({competitions.filter((c) => c.status === "UPCOMING" || (c.startDate && new Date(c.startDate) > new Date())).length})
          </button>

          <button
            onClick={() => { setActiveTab("past"); setSelectedCompetitionFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "past" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "past" ? "#fff" : "#475569",
              boxShadow: activeTab === "past" ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
              transition: "all 0.2s"
            }}
          >
            📜 Past Competitions ({competitions.filter((c) => !c.isLive || c.status === "COMPLETED" || (c.endDate && new Date(c.endDate) < new Date())).length})
          </button>
        </div>

        {msg && <div style={{ padding: "14px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "20px", fontWeight: "600" }}>{msg}</div>}

        {/* SECTION 1: COMPETITIONS TABLE FOR ACTIVE / UPCOMING / PAST */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", textTransform: "capitalize" }}>
            {activeTab === "active" && "🏆 Active Competitions List"}
            {activeTab === "upcoming" && "⏳ Upcoming Competitions List"}
            {activeTab === "past" && "📜 Past Competitions List"}
          </h3>

          {(() => {
            const filteredComps = competitions.filter((c) => {
              if (activeTab === "active") return (c.isLive === true || c.isLive === 1 || String(c.isLive) === "true") && c.status !== "COMPLETED";
              if (activeTab === "upcoming") return c.status === "UPCOMING" || (c.startDate && new Date(c.startDate) > new Date());
              if (activeTab === "past") return !c.isLive || c.status === "COMPLETED" || (c.endDate && new Date(c.endDate) < new Date());
              return true;
            });

            if (filteredComps.length === 0) {
              return (
                <p style={{ color: "#64748b", padding: "20px 0" }}>
                  No {activeTab} competitions found. {activeTab === "active" && 'Click "+ Create New Competition" to create one.'}
                </p>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                {filteredComps.map((c) => {
                  const isSelected = selectedCompetitionFilter === c.competitionId;
                  const isCompleted = !c.isLive || c.status === "COMPLETED";
                  const submissionCount = submissions.filter(s => s.competitionId === c.competitionId).length;

                  return (
                    <div
                      key={c.competitionId}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "14px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 8px 24px rgba(37, 99, 235, 0.15)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justify: "space-between",
                        transition: "all 0.2s ease-in-out",
                        position: "relative"
                      }}
                    >
                      {/* CARD HEADER */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", backgroundColor: "#eff6ff", padding: "4px 10px", borderRadius: "8px", letterSpacing: "0.5px" }}>
                            ID: {c.competitionId}
                          </span>
                          <span style={{ backgroundColor: c.isLive ? "#dcfce7" : "#fee2e2", color: c.isLive ? "#166534" : "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                            {c.isLive ? "🟢 LIVE" : "🔴 ENDED"}
                          </span>
                        </div>

                        <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 10px 0", lineHeight: "1.3" }}>
                          {c.title}
                        </h4>

                        {/* COMPETITION METADATA METRICS */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                          <div style={{ backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>
                            🏫 <strong style={{ color: "#0f172a" }}>
                              {c.participatingSchools && c.participatingSchools.length > 0
                                ? c.participatingSchools.length
                                : Array.from(new Set(submissions.filter(s => s.competitionId === c.competitionId && s.schoolName).map(s => s.schoolName.trim().toLowerCase()))).length}
                            </strong> Schools
                          </div>
                          <div style={{ backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "12px", color: "#475569" }}>
                            🔑 Code: <strong style={{ color: "#2563eb" }}>{c.verificationCode}</strong>
                          </div>
                          <div style={{ backgroundColor: c.winnerAnnouncementMode === "AUTOMATIC" ? "#e0e7ff" : "#fef3c7", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", color: c.winnerAnnouncementMode === "AUTOMATIC" ? "#3730a3" : "#92400e" }}>
                            ⚡ Mode: {c.winnerAnnouncementMode}
                          </div>
                        </div>
                      </div>

                      {/* CARD ACTION BUTTONS */}
                      <div style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {/* SELECT & VIEW SUBMISSIONS PRIMARY BUTTON */}
                        <button
                          onClick={() => {
                            setSelectedCompetitionFilter(c.competitionId);
                            setTimeout(() => {
                              const subSection = document.getElementById("student-submissions-section");
                              if (subSection) subSection.scrollIntoView({ behavior: "smooth" });
                            }, 50);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: isSelected ? "#16a34a" : "#059669",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "13px",
                            cursor: "pointer",
                            boxShadow: isSelected ? "0 4px 12px rgba(22, 163, 74, 0.3)" : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          📥 View Submissions ({submissionCount})
                        </button>

                        {/* EDIT, DELETE, TOGGLE LIVE BUTTONS GROUP */}
                        <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                          <div style={{ display: "inline-flex", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", flex: 1 }}>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Competition"
                              style={{ flex: 1, padding: "8px 10px", backgroundColor: "#f59e0b", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCompetition(c)}
                              disabled={isCompleted}
                              title={isCompleted ? "Over/Completed competitions cannot be deleted" : "Delete competition"}
                              style={{
                                flex: 1,
                                padding: "8px 10px",
                                backgroundColor: isCompleted ? "#cbd5e1" : "#ef4444",
                                color: isCompleted ? "#64748b" : "#fff",
                                border: "none",
                                borderLeft: "1px solid #ffffff44",
                                cursor: isCompleted ? "not-allowed" : "pointer",
                                fontWeight: "600",
                                fontSize: "12px"
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          <button
                            onClick={() => toggleLiveStatus(c)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: c.isLive ? "#64748b" : "#22c55e",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "12px"
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
          <div id="student-submissions-section" style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            {/* SINGLE LINE ROW FOR HEADING, SEARCH BAR & COMPETITION FILTER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "nowrap" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, whiteSpace: "nowrap" }}>
                📥 Student Submissions ({selectedCompetitionFilter === "ALL" ? "All Entries" : selectedCompetitionFilter})
              </h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: "flex-end" }}>
                {/* SEARCH INPUT BY STUDENT NAME, SCHOOL, COMPETITION NAME */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search Student, School, Competition..."
                  style={{ padding: "9px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", minWidth: "280px", maxWidth: "360px", flex: 1, outline: "none", backgroundColor: "#f8fafc" }}
                />

                {/* COMPETITION WISE FILTER DROPDOWN */}
                <select
                  value={selectedCompetitionFilter}
                  onChange={(e) => setSelectedCompetitionFilter(e.target.value)}
                  style={{ padding: "9px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "13px", backgroundColor: "#f8fafc", outline: "none" }}
                >
                  <option value="ALL">All Competitions ({submissions.length})</option>
                  {Array.from(new Set([...competitions.map(c => c.competitionId), ...submissions.map(s => s.competitionId)])).map((compId) => {
                    const comp = competitions.find(c => c.competitionId === compId);
                    const count = submissions.filter(s => s.competitionId === compId).length;
                    const title = comp ? comp.title : compId;
                    return (
                      <option key={compId} value={compId}>
                        {title} ({compId}) - [{count} entries]
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {(() => {
              let filteredSubmissions = selectedCompetitionFilter === "ALL"
                ? submissions
                : submissions.filter(s => s.competitionId === selectedCompetitionFilter);

              // Apply Search Query filter (by Student Name, School Name, Group Category, Entry Title, Competition ID/Name)
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                filteredSubmissions = filteredSubmissions.filter((sub) => {
                  const comp = competitions.find(c => c.competitionId === sub.competitionId);
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

              if (filteredSubmissions.length === 0) {
                return <p style={{ color: "#64748b", padding: "16px 0" }}>No student submissions found matching your filter.</p>;
              }

              return (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Submission ID</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Competition ID</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Student Name</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Group / Category</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>School Name</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Class & Roll</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Entry Title</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Video Link</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>⭐ Judge Marks</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Actions</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>🏆 Announce Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.submissionId}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", color: "#2563eb" }}>{sub.submissionId}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.competitionId}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.studentName}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: "1px solid #cbd5e1" }}>
                            {sub.groupCategory || "Group A (Class 5-8)"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>{sub.schoolName}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>{sub.classGrade} (Roll: {sub.rollNumber})</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>{sub.entryTitle}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {sub.videoUrl ? (
                            <button
                              onClick={() => setPlayingVideoUrl(sub.videoUrl)}
                              style={{ padding: "6px 12px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                            >
                              ▶ Play Video
                            </button>
                          ) : (
                            "No Video"
                          )}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {sub.totalScore !== undefined && sub.totalScore !== null ? (
                            <div>
                              <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "12px", display: "inline-block" }}>
                                ⭐ {sub.totalScore} / 50 Marks
                              </span>
                              {sub.judgeRemarks && (
                                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px", fontStyle: "italic" }}>
                                  "{sub.judgeRemarks}"
                                </div>
                              )}
                            </div>
                          ) : sub.status === "COMPLETED" ? (
                            <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "12px" }}>
                              ✓ Evaluated
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>Not Graded Yet</span>
                          )}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {sub.status === "REJECTED" ? (
                            <div>
                              <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", display: "inline-block", marginBottom: "4px" }}>
                                🚫 REJECTED
                              </span>
                              {sub.rejectionReason && (
                                <div style={{ fontSize: "11px", color: "#b91c1c", fontWeight: "600" }}>
                                  Reason: {sub.rejectionReason}
                                </div>
                              )}
                              {sub.rejectedBy && (
                                <div style={{ fontSize: "10px", color: "#64748b" }}>
                                  By: {sub.rejectedBy}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenRejectModal(sub.submissionId)}
                              title="Reject Student Submission"
                              style={{ padding: "6px 12px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                            >
                              🚫 Reject
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                          {sub.status === "REJECTED" ? (
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>Not Eligible (Rejected)</span>
                          ) : (() => {
                            const comp = competitions.find(c => c.competitionId === sub.competitionId);
                            const mode = comp ? comp.winnerAnnouncementMode : "AUTOMATIC";
                            const isManualMode = (mode === "MANUAL" || mode === "CHOICE");
                            const isAutomaticMode = (mode === "AUTOMATIC" || mode === "AUTO");

                            if (isAutomaticMode) {
                              return (
                                <div>
                                  <span style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", display: "inline-block" }}>
                                    🤖 Auto Mode (System Evaluated)
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {isManualMode && !sub.winnerRank && (
                                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: "4px", width: "fit-content" }}>
                                    ⚡ MANUAL MODE (Choose Winner)
                                  </span>
                                )}
                                <select
                                  value={sub.winnerRank || ""}
                                  onChange={(e) => handleAnnounceWinner(sub.submissionId, e.target.value)}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: isManualMode && !sub.winnerRank ? "2px solid #f59e0b" : sub.winnerRank ? "2px solid #eab308" : "1px solid #cbd5e1",
                                    backgroundColor: isManualMode && !sub.winnerRank ? "#fffbebe6" : sub.winnerRank === 1 ? "#fef9c3" : sub.winnerRank === 2 ? "#f1f5f9" : sub.winnerRank === 3 ? "#ffedd5" : "#fff",
                                    boxShadow: isManualMode && !sub.winnerRank ? "0 0 8px rgba(245, 158, 11, 0.4)" : "none",
                                    fontWeight: "700",
                                    fontSize: "12px",
                                    color: "#1e293b",
                                    cursor: "pointer"
                                  }}
                                >
                                  <option value="">-- Choose Winner --</option>
                                  <option value="1">🥇 1st Place Winner</option>
                                  <option value="2">🥈 2nd Place Winner</option>
                                  <option value="3">🥉 3rd Place Winner</option>
                                </select>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}

        {/* CREATE COMPETITION MODAL */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div
              className="hide-scrollbar"
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "32px 36px",
                width: "92%",
                maxWidth: "850px",
                maxHeight: "88vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}
            >
              {/* FIXED 360-DEGREE ROTATING CLOSE BUTTON AT TOP RIGHT CORNER */}
              <button
                type="button"
                className="rotate-close-btn"
                onClick={handleCloseCreate}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: "-18px",
                  float: "right",
                  marginTop: "-20px",
                  marginRight: "-24px",
                  zIndex: 20,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
                }}
              >
                ✕
              </button>

              <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>➕ Create New School Competition</h3>
              <form onSubmit={handleCreateCompetition} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Competition ID * (e.g. COMP-2026-AUG-001)</label>
                  <input required type="text" value={newComp.competitionId} onChange={(e) => setNewComp({ ...newComp, competitionId: e.target.value })} placeholder="COMP-2026-AUG-001" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Competition Title *</label>
                  <input required type="text" value={newComp.title} onChange={(e) => setNewComp({ ...newComp, title: e.target.value })} placeholder="e.g. Public Speaking Competition" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Description</label>
                  <textarea rows="3" value={newComp.description} onChange={(e) => setNewComp({ ...newComp, description: e.target.value })} placeholder="Enter competition guidelines" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                {/* SELECT PARTICIPATING SCHOOLS FROM SCHOOL LIST */}
                <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Select Participating Schools</label>
                    <button type="button" onClick={() => setShowSchoolModal(true)} style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700", background: "none", border: "none", cursor: "pointer" }}>+ Manage / Add Schools</button>
                  </div>

                  {(() => {
                    const availableSchools = masterSchools.filter((sch) => !schoolList.includes(sch.name));
                    return (
                      <select
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "600" }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "ADD_ALL") {
                            const allNames = masterSchools.map((s) => s.name);
                            setSchoolList(Array.from(new Set([...schoolList, ...allNames])));
                          } else if (val && !schoolList.includes(val)) {
                            setSchoolList([...schoolList, val]);
                          }
                        }}
                        value=""
                      >
                        <option value="">-- Select School ({availableSchools.length} Remaining / Available) --</option>
                        {availableSchools.length > 0 && (
                          <option value="ADD_ALL" style={{ fontWeight: "700", color: "#16a34a" }}>
                            ➕ Add All Schools ({availableSchools.length} Schools)
                          </option>
                        )}
                        {availableSchools.map((sch) => (
                          <option key={sch.id} value={sch.name}>{sch.name}</option>
                        ))}
                      </select>
                    );
                  })()}

                  {/* Selected School Chips */}
                  {schoolList.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {schoolList.map((s, idx) => (
                        <span key={idx} style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "6px 12px", borderRadius: "14px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          {s}
                          <button type="button" onClick={() => handleRemoveSchool(s)} style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>✕</button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", display: "block" }}>No schools selected yet. Choose schools from dropdown above.</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Start Date *</label>
                    <input required type="date" value={newComp.startDate} onChange={(e) => setNewComp({ ...newComp, startDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>End Date *</label>
                    <input required type="date" value={newComp.endDate} onChange={(e) => setNewComp({ ...newComp, endDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Category *</label>
                  <select value={newComp.category} onChange={(e) => setNewComp({ ...newComp, category: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                    <option value="Public Speaking">Public Speaking</option>
                    <option value="Science Project">Science Project</option>
                    <option value="Kojo Competition">Kojo Competition</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Single Shared School Verification Code *</label>
                  <input required type="text" value={newComp.verificationCode} onChange={(e) => setNewComp({ ...newComp, verificationCode: e.target.value })} placeholder="e.g. SG-SCHOOL-2026" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Winner Announcement Mode</label>
                  <select value={newComp.winnerAnnouncementMode} onChange={(e) => setNewComp({ ...newComp, winnerAnnouncementMode: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                    <option value="AUTOMATIC">AUTOMATIC (Auto-rank top 3)</option>
                    <option value="MANUAL">MANUAL (Admin manual trigger)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>Create Competition</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT COMPETITION MODAL */}
        {showEditModal && editingComp && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div
              className="hide-scrollbar"
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "32px 36px",
                width: "92%",
                maxWidth: "850px",
                maxHeight: "88vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}
            >
              {/* FIXED 360-DEGREE ROTATING CLOSE BUTTON AT TOP RIGHT CORNER */}
              <button
                type="button"
                className="rotate-close-btn"
                onClick={() => { setShowEditModal(false); setEditingComp(null); setSchoolList([]); }}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: "-18px",
                  float: "right",
                  marginTop: "-20px",
                  marginRight: "-24px",
                  zIndex: 20,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
                }}
              >
                ✕
              </button>

              <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>✏️ Edit School Competition</h3>
              <form onSubmit={handleUpdateCompetition} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Competition ID (Read Only)</label>
                  <input disabled type="text" value={editingComp.competitionId} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#f1f5f9" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Competition Title *</label>
                  <input required type="text" value={editingComp.title} onChange={(e) => setEditingComp({ ...editingComp, title: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Description</label>
                  <textarea rows="3" value={editingComp.description} onChange={(e) => setEditingComp({ ...editingComp, description: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                {/* EDIT PARTICIPATING SCHOOLS SECTION WITH MASTER LIST DROPDOWN */}
                <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Participating Schools</label>
                    <button type="button" onClick={() => setShowSchoolModal(true)} style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700", background: "none", border: "none", cursor: "pointer" }}>+ Manage / Add Schools</button>
                  </div>

                  {(() => {
                    const availableSchools = masterSchools.filter((sch) => !schoolList.includes(sch.name));
                    return (
                      <select
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "600" }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "ADD_ALL") {
                            const allNames = masterSchools.map((s) => s.name);
                            setSchoolList(Array.from(new Set([...schoolList, ...allNames])));
                          } else if (val && !schoolList.includes(val)) {
                            setSchoolList([...schoolList, val]);
                          }
                        }}
                        value=""
                      >
                        <option value="">-- Add School ({availableSchools.length} Remaining / Available) --</option>
                        {availableSchools.length > 0 && (
                          <option value="ADD_ALL" style={{ fontWeight: "700", color: "#16a34a" }}>
                            ➕ Add All Schools ({availableSchools.length} Schools)
                          </option>
                        )}
                        {availableSchools.map((sch) => (
                          <option key={sch.id} value={sch.name}>{sch.name}</option>
                        ))}
                      </select>
                    );
                  })()}

                  {/* School List Display */}
                  {schoolList.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                      {schoolList.map((s, idx) => (
                        <span key={idx} style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "6px 12px", borderRadius: "14px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          {s}
                          <button type="button" onClick={() => handleRemoveSchool(s)} style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>✕</button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", display: "block" }}>No participating schools selected.</span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Start Date *</label>
                    <input required type="date" value={editingComp.startDate} onChange={(e) => setEditingComp({ ...editingComp, startDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>End Date *</label>
                    <input required type="date" value={editingComp.endDate} onChange={(e) => setEditingComp({ ...editingComp, endDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Category *</label>
                  <select value={editingComp.category} onChange={(e) => setEditingComp({ ...editingComp, category: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                    <option value="Public Speaking">Public Speaking</option>
                    <option value="Science Project">Science Project</option>
                    <option value="Kojo Competition">Kojo Competition</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Single Shared School Verification Code *</label>
                  <input required type="text" value={editingComp.verificationCode} onChange={(e) => setEditingComp({ ...editingComp, verificationCode: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Winner Announcement Mode</label>
                  <select value={editingComp.winnerAnnouncementMode} onChange={(e) => setEditingComp({ ...editingComp, winnerAnnouncementMode: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                    <option value="AUTOMATIC">AUTOMATIC (Auto-rank top 3)</option>
                    <option value="MANUAL">MANUAL (Admin manual trigger)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingComp(null); setSchoolList([]); }} style={{ flex: 1, padding: "12px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IN-APP YOUTUBE / MEDIA VIDEO PLAYER MODAL */}
        {playingVideoUrl && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
            <div style={{ backgroundColor: "#000", borderRadius: "12px", padding: "16px", width: "100%", maxWidth: "800px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", color: "#fff" }}>
                <span style={{ fontWeight: "700", fontSize: "16px" }}>▶ Video Submission Preview</span>
                <button onClick={() => setPlayingVideoUrl(null)} style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontWeight: "700" }}>Close ✕</button>
              </div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px" }}>
                <iframe
                  src={getEmbedUrl(playingVideoUrl)}
                  title="Submission Entry Video"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
        {/* MASTER SCHOOL MANAGEMENT MODAL */}
        {showSchoolModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
            <div
              className="hide-scrollbar"
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "32px 36px",
                width: "92%",
                maxWidth: "900px",
                maxHeight: "88vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}
            >
              <button
                type="button"
                className="rotate-close-btn"
                onClick={() => { setShowSchoolModal(false); setEditingSchool(null); setMasterSchoolInput({ name: "", address: "", code: "" }); }}
                title="Close Modal"
                style={{
                  position: "sticky",
                  top: "-18px",
                  float: "right",
                  marginTop: "-20px",
                  marginRight: "-24px",
                  zIndex: 20,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
                }}
              >
                ✕
              </button>

              <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "22px", fontWeight: "700", color: "#0f172a" }}>🏫 Central Schools Management</h3>

              {/* Input Mode Selector */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setMasterSchoolInputMode("MANUAL")}
                  style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", borderRadius: "6px", border: "none", cursor: "pointer", backgroundColor: masterSchoolInputMode === "MANUAL" ? "#16a34a" : "#e2e8f0", color: masterSchoolInputMode === "MANUAL" ? "#fff" : "#475569" }}
                >
                  + Add / Edit School Single Form
                </button>
                <button
                  type="button"
                  onClick={() => setMasterSchoolInputMode("FILE")}
                  style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", borderRadius: "6px", border: "none", cursor: "pointer", backgroundColor: masterSchoolInputMode === "FILE" ? "#16a34a" : "#e2e8f0", color: masterSchoolInputMode === "FILE" ? "#fff" : "#475569" }}
                >
                  📁 Bulk Upload via XLS / CSV / Doc
                </button>
              </div>

              {/* Single School Form */}
              {masterSchoolInputMode === "MANUAL" && (
                <form onSubmit={handleAddMasterSchoolSingle} style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>School Name *</label>
                      <input required type="text" value={masterSchoolInput.name} onChange={(e) => setMasterSchoolInput({ ...masterSchoolInput, name: e.target.value })} placeholder="Enter exact school name" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>School Code (Optional)</label>
                      <input type="text" value={masterSchoolInput.code} onChange={(e) => setMasterSchoolInput({ ...masterSchoolInput, code: e.target.value })} placeholder="e.g. SCH-01" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" style={{ padding: "10px 24px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                      {editingSchool ? "✓ Update School" : "+ Add School to Master List"}
                    </button>
                    {editingSchool && (
                      <button type="button" onClick={() => { setEditingSchool(null); setMasterSchoolInput({ name: "", address: "", code: "" }); }} style={{ padding: "10px 18px", backgroundColor: "#94a3b8", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Bulk XLS Upload Mode */}
              {masterSchoolInputMode === "FILE" && (
                <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Select Excel / CSV / Doc File to Bulk Add Schools</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv, .pdf, .doc, .docx"
                      onChange={handleMasterFileChange}
                      style={{ flex: 1, padding: "10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                    <button
                      type="button"
                      onClick={handleProcessMasterFileUpload}
                      style={{ padding: "10px 24px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      📤 Upload & Process File
                    </button>
                  </div>
                  {selectedBulkFile && (
                    <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600", display: "block", marginTop: "6px" }}>
                      ✓ Selected File: {selectedBulkFile.name} (Click "Upload & Process File" button above to add schools)
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", display: "block" }}>All clean school names from the uploaded file will be added directly into the Central Schools Database.</span>
                </div>
              )}

              {/* Master Schools Table */}
              <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>Master Schools Database ({masterSchools.length} Schools)</h4>
              {masterSchools.length === 0 ? (
                <p style={{ color: "#64748b" }}>No schools in master list. Add school manually or upload Excel file above.</p>
              ) : (
                <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f1f5f9", position: "sticky", top: 0 }}>
                        <th style={{ padding: "10px 14px" }}>#</th>
                        <th style={{ padding: "10px 14px" }}>School Name</th>
                        <th style={{ padding: "10px 14px" }}>Code</th>
                        <th style={{ padding: "10px 14px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterSchools.map((sch, idx) => (
                        <tr key={sch.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px", fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                          <td style={{ padding: "10px 14px", fontWeight: "700", color: "#0f172a" }}>{sch.name}</td>
                          <td style={{ padding: "10px 14px", color: "#2563eb", fontWeight: "600" }}>{sch.code || "-"}</td>
                          <td style={{ padding: "10px 14px", display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => { setEditingSchool(sch); setMasterSchoolInput({ name: sch.name, address: sch.address || "", code: sch.code || "" }); setMasterSchoolInputMode("MANUAL"); }}
                              style={{ padding: "4px 10px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMasterSchool(sch.id, sch.name)}
                              style={{ padding: "4px 10px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
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
        {/* REJECT SUBMISSION MODAL WITH REASON PROMPT */}
        {showRejectModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "28px 32px",
                width: "90%",
                maxWidth: "520px",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "20px", fontWeight: "700", color: "#dc2626" }}>
                🚫 Reject Student Submission ({rejectingSubmissionId})
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                Please specify the mandatory reason for rejecting this student submission. This will be recorded for audit purposes.
              </p>

              <form onSubmit={handleConfirmRejectSubmission}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#1e293b" }}>
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Enter clear rejection reason (e.g. Invalid Video URL, Off-topic content, Incorrect School code...)"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => { setShowRejectModal(false); setRejectingSubmissionId(""); setRejectionReasonInput(""); }}
                    style={{ padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "10px 24px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
