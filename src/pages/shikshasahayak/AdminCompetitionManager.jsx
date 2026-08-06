import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./adminSchoolCompetition.css";

export default function AdminCompetitionManager() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompetitions();
    fetchSubmissions();
  }, []);

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
      console.error(err);
      alert("Failed to create competition on server.");
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

  const [activeTab, setActiveTab] = useState("competitions");
  const [submissions, setSubmissions] = useState([]);
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] = useState("ALL");
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

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
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: "12px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
          >
            + Create New Competition
          </button>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("competitions")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "competitions" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "competitions" ? "#fff" : "#475569"
            }}
          >
            🏆 Active Competitions
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "submissions" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "submissions" ? "#fff" : "#475569"
            }}
          >
            📥 Student Submissions ({submissions.length})
          </button>
        </div>

        {msg && <div style={{ padding: "14px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "20px", fontWeight: "600" }}>{msg}</div>}

        {/* SECTION 1: COMPETITION CONTROL TABLE */}
        {activeTab === "competitions" && (
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Active Competitions & Settings</h3>
          {competitions.length === 0 ? (
            <p style={{ color: "#64748b" }}>No competitions created yet. Click "+ Create New Competition" to create one.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Competition ID</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Title</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Schools Added</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Single Shared Code</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Live Status</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Winner Mode</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((c) => (
                  <tr key={c.competitionId}>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", color: "#2563eb" }}>{c.competitionId}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>{c.title}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                        {c.participatingSchools?.length || 0} Schools
                      </span>
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{c.verificationCode}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ backgroundColor: c.isLive ? "#dcfce7" : "#fee2e2", color: c.isLive ? "#166534" : "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                        {c.isLive ? "LIVE (Event Tab + Dropdown)" : "ENDED (Shiksha Sahayak Only)"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ backgroundColor: c.winnerAnnouncementMode === "AUTOMATIC" ? "#e0e7ff" : "#fef3c7", color: c.winnerAnnouncementMode === "AUTOMATIC" ? "#3730a3" : "#92400e", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                        {c.winnerAnnouncementMode}
                      </span>
                    </td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => toggleLiveStatus(c)} style={{ padding: "6px 12px", backgroundColor: c.isLive ? "#ef4444" : "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
                          {c.isLive ? "End Competition" : "Make Live"}
                        </button>
                        <button onClick={() => toggleWinnerMode(c)} style={{ padding: "6px 12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
                          Switch Mode
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        )}

        {/* SECTION 2: STUDENT SUBMISSIONS TABLE FOR SUPER ADMIN */}
        {activeTab === "submissions" && (
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Student Competition Submissions</h3>
              
              {/* COMPETITION WISE FILTER DROPDOWN */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Filter by Competition:</label>
                <select
                  value={selectedCompetitionFilter}
                  onChange={(e) => setSelectedCompetitionFilter(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "13px", backgroundColor: "#f8fafc" }}
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
              const filteredSubmissions = selectedCompetitionFilter === "ALL"
                ? submissions
                : submissions.filter(s => s.competitionId === selectedCompetitionFilter);

              if (filteredSubmissions.length === 0) {
                return <p style={{ color: "#64748b", padding: "16px 0" }}>No student submissions found for this competition.</p>;
              }

              return (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Submission ID</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Competition ID</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Student Name</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>School Name</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Class & Roll</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Entry Title</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Video Link</th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #e2e8f0" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.submissionId}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", color: "#2563eb" }}>{sub.submissionId}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.competitionId}</td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.studentName}</td>
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
                          <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                            {sub.status || "Submitted"}
                          </span>
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
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Create New School Competition</h3>
                <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleCreateCompetition} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                  <textarea rows="2" value={newComp.description} onChange={(e) => setNewComp({ ...newComp, description: e.target.value })} placeholder="Enter competition guidelines" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                {/* ADD PARTICIPATING SCHOOLS SECTION */}
                <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Add Participating Schools</label>

                  {/* Mode Selector */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setSchoolInputMode("MANUAL")}
                      style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "600", borderRadius: "6px", border: "none", cursor: "pointer", backgroundColor: schoolInputMode === "MANUAL" ? "#2563eb" : "#e2e8f0", color: schoolInputMode === "MANUAL" ? "#fff" : "#475569" }}
                    >
                      + Add Name Manually
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolInputMode("FILE")}
                      style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "600", borderRadius: "6px", border: "none", cursor: "pointer", backgroundColor: schoolInputMode === "FILE" ? "#2563eb" : "#e2e8f0", color: schoolInputMode === "FILE" ? "#fff" : "#475569" }}
                    >
                      📁 Upload File (Excel, Word, PDF, CSV)
                    </button>
                  </div>

                  {/* Manual Input Mode */}
                  {schoolInputMode === "MANUAL" && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={schoolNameInput}
                        onChange={(e) => setSchoolNameInput(e.target.value)}
                        placeholder="Enter School Name"
                        style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                      <button type="button" onClick={handleAddSchoolName} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Add</button>
                    </div>
                  )}

                  {/* File Upload Mode */}
                  {schoolInputMode === "FILE" && (
                    <div style={{ marginBottom: "10px" }}>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv, .pdf, .doc, .docx"
                        onChange={handleFileUpload}
                        style={{ width: "100%", padding: "6px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                      {uploadedFileName && <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600", display: "block", marginTop: "4px" }}>✓ Uploaded: {uploadedFileName}</span>}
                    </div>
                  )}

                  {/* School List Display */}
                  {schoolList.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {schoolList.map((s, idx) => (
                        <span key={idx} style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          {s}
                          <button type="button" onClick={() => handleRemoveSchool(s)} style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer", fontWeight: "700" }}>✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>Create Competition</button>
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
      </main>
    </div>
  );
}
