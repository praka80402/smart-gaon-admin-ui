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
    } catch (err) {
      console.error(err);
      alert("Failed to update competition.");
    }
  };

  const handleDeleteCompetition = async (comp) => {
    if (!comp.isLive || comp.status === "COMPLETED") {
      alert(
        "⚠️ Over/Completed competitions cannot be deleted once completed or winners are announced!",
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete competition '${comp.title}'?`,
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(
        `/admin/school-competitions/${comp.competitionId}`,
      );
      setCompetitions(
        competitions.filter((c) => c.competitionId !== comp.competitionId),
      );
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
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] =
    useState("NONE");
  const [searchQuery, setSearchQuery] = useState("");
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
  const [editingPrizeVideoId, setEditingPrizeVideoId] = useState(null);
  const [prizeVideoForm, setPrizeVideoForm] = useState({
    competitionId: "",
    competitionName: "",
    category: "",
    videoUrl: "",
  });

  const handleOpenPrizeModal = () => {
    setPrizeModalTab("ADD");
    setPrizeVideoForm({
      competitionId: "",
      competitionName: "",
      category: "",
      videoUrl: "",
    });
    setEditingPrizeVideoId(null);
    setShowPrizeModal(true);
  };

  const handleClosePrizeModal = () => {
    setShowPrizeModal(false);
    setPrizeVideoForm({
      competitionId: "",
      competitionName: "",
      category: "",
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
    });
  };

  const handleSubmitPrizeVideo = (e) => {
    e.preventDefault();
    if (!prizeVideoForm.competitionId) {
      alert("⚠️ Please select a Competition ID!");
      return;
    }
    if (!prizeVideoForm.videoUrl.trim()) {
      alert("⚠️ Please paste a Video URL!");
      return;
    }
    if (editingPrizeVideoId) {
      setPrizeVideos(
        prizeVideos.map((v) =>
          v.id === editingPrizeVideoId
            ? { ...prizeVideoForm, id: editingPrizeVideoId }
            : v,
        ),
      );
      setMsg(
        `✓ Prize distribution video for '${prizeVideoForm.competitionName || prizeVideoForm.competitionId}' updated successfully!`,
      );
    } else {
      const newVideo = { ...prizeVideoForm, id: `PDV-${Date.now()}` };
      setPrizeVideos((prev) => [...prev, newVideo]);
      setMsg(
        `✓ Prize distribution video for '${prizeVideoForm.competitionName || prizeVideoForm.competitionId}' added successfully!`,
      );
    }
    setPrizeVideoForm({
      competitionId: "",
      competitionName: "",
      category: "",
      videoUrl: "",
    });
    setEditingPrizeVideoId(null);
    setPrizeModalTab("EDIT");
  };

  const handleEditPrizeVideo = (video) => {
    setPrizeVideoForm({
      competitionId: video.competitionId,
      competitionName: video.competitionName,
      category: video.category,
      videoUrl: video.videoUrl,
    });
    setEditingPrizeVideoId(video.id);
    setPrizeModalTab("ADD");
  };

  const handleDeletePrizeVideo = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this prize distribution video?",
      )
    )
      return;
    setPrizeVideos(prizeVideos.filter((v) => v.id !== id));
    setMsg("✓ Prize distribution video deleted successfully!");
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

  const rankClass = (sub, isManualMode) => {
    if (isManualMode && !sub.winnerRank) return "pending";
    if (sub.winnerRank === 1) return "rank-1";
    if (sub.winnerRank === 2) return "rank-2";
    if (sub.winnerRank === 3) return "rank-3";
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

        {msg && (
          <div className="admin-sc-message-banner">
            <span style={{ fontSize: 16 }}>✓</span>
            {msg}
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
                            alignItems: "flex-start",
                            marginBottom: 12,
                          }}
                        >
                          <span className="admin-sc-id-tag">
                            {c.competitionId}
                          </span>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search Student, School, Competition..."
                  style={{ minWidth: 280, maxWidth: 360, flex: 1 }}
                />

                {/* COMPETITION WISE FILTER DROPDOWN */}
                <select
                  className="admin-sc-filter-select"
                  value={selectedCompetitionFilter}
                  onChange={(e) => setSelectedCompetitionFilter(e.target.value)}
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
              </div>
            </div>

            {(() => {
              let filteredSubmissions =
                selectedCompetitionFilter === "ALL"
                  ? submissions
                  : submissions.filter(
                      (s) => s.competitionId === selectedCompetitionFilter,
                    );

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

              if (filteredSubmissions.length === 0) {
                return (
                  <p className="admin-sc-empty-note">
                    No student submissions found matching your filter.
                  </p>
                );
              }

              return (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-sc-table">
                    <thead>
                      <tr>
                        <th>Submission ID</th>
                        <th>Competition ID</th>
                        <th>Student Name</th>
                        <th>Group / Category</th>
                        <th>School Name</th>
                        <th>Class &amp; Roll</th>
                        <th>Entry Title</th>
                        <th>Video Link</th>
                        <th>⭐ Judge Marks</th>
                        <th>Actions</th>
                        <th>🏆 Announce Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.submissionId}>
                          <td className="id-cell">{sub.submissionId}</td>
                          <td
                            className="nowrap-cell"
                            style={{ fontWeight: 600 }}
                          >
                            {sub.competitionId}
                          </td>
                          <td
                            className="wrap-cell"
                            style={{ fontWeight: 600, color: "var(--sc-ink)" }}
                          >
                            {sub.studentName}
                          </td>
                          <td className="nowrap-cell">
                            <span className="admin-sc-group-chip">
                              {sub.groupCategory || "Group A (Class 5-8)"}
                            </span>
                          </td>
                          <td className="wrap-cell">{sub.schoolName}</td>
                          <td className="nowrap-cell">
                            {sub.classGrade} (Roll: {sub.rollNumber})
                          </td>
                          <td className="wrap-cell">{sub.entryTitle}</td>
                          <td className="nowrap-cell">
                            {sub.videoUrl ? (
                              sub.videoUrl.startsWith("data:image") || sub.videoUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
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
                              <span
                                style={{
                                  color: "var(--sc-slate-soft)",
                                  fontSize: 12,
                                }}
                              >
                                No Media
                              </span>
                            )}
                          </td>
                          <td>
                            {sub.totalScore !== undefined &&
                            sub.totalScore !== null ? (
                              <div>
                                <span
                                  className="admin-sc-badge evaluated"
                                  style={{ fontSize: 12 }}
                                >
                                  ⭐ {sub.totalScore} / 50 Marks
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
                                        🤖 Auto Mode
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 4,
                                    }}
                                  >
                                    {isManualMode && !sub.winnerRank && (
                                      <span className="admin-sc-manual-flag">
                                        ⚡ MANUAL MODE (Choose Winner)
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
                                      <option value="1">
                                        🥇 1st Place Winner
                                      </option>
                                      <option value="2">
                                        🥈 2nd Place Winner
                                      </option>
                                      <option value="3">
                                        🥉 3rd Place Winner
                                      </option>
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
                <span>▶ Video Submission Preview</span>
                <button
                  className="admin-sc-btn admin-sc-btn-danger solid"
                  onClick={() => setPlayingVideoUrl(null)}
                  style={{ borderRadius: 8, padding: "6px 14px" }}
                >
                  Close ✕
                </button>
              </div>

              {playingVideoUrl.startsWith("data:image") || playingVideoUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|heic)$/i) ? (
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
          <div className="admin-sc-modal-overlay">
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
                    value={newComp.category}
                    onChange={(e) =>
                      setNewComp({ ...newComp, category: e.target.value })
                    }
                    style={{ width: "100%", backgroundColor: "#fff" }}
                  >
                    <option value="Public Speaking">Public Speaking</option>
                    <option value="Science Project">Science Project</option>
                    <option value="Kojo Competition">Kojo Competition</option>
                  </select>
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
                          -- Select School ({availableSchools.length} Remaining
                          / Available) --
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

                  {/* Selected School Chips */}
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
                      No schools selected yet. Choose schools from dropdown
                      above.
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
                  <label className="admin-sc-field-label">
                    Category (Fixed)
                  </label>
                  <input
                    disabled
                    type="text"
                    value={editingComp.category}
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
                      End Date (Fixed)
                    </label>
                    <input
                      disabled
                      className="admin-sc-input"
                      type="date"
                      value={editingComp.endDate}
                      style={{
                        width: "100%",
                        backgroundColor: "var(--sc-paper)",
                        color: "var(--sc-slate)",
                        cursor: "not-allowed",
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
                  {prizeVideos.length === 0 ? (
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
      </main>
    </div>
  );
}
