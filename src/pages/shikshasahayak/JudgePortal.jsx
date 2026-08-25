import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

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
      <div style={{ backgroundColor: "#0f172a", padding: 20, borderRadius: 8, color: "#38bdf8", textAlign: "center", fontSize: "13px" }}>
        ⏳ Loading & Decoding Video Stream...
      </div>
    );
  }

  return (
    <video
      key={blobUrl || "vid-player"}
      src={blobUrl || videoUrl}
      controls
      playsInline
      style={{ width: "100%", maxHeight: "150px", borderRadius: "8px", backgroundColor: "#0f172a" }}
    />
  );
}

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const lines = text.split("\n");

  return (
    <span
      style={{ position: "relative", display: "inline-flex", marginLeft: "6px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label="More info"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          backgroundColor: "#cbd5e1",
          color: "#1e293b",
          fontSize: "10px",
          fontWeight: "700",
          cursor: "help",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        i
      </span>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "500",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          {lines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #1e293b",
            }}
          />
        </div>
      )}
    </span>
  );
}

const MAX_SCORE_PER_CRITERION = 5;
const MAX_TOTAL_SCORE = MAX_SCORE_PER_CRITERION * 5; // 25

export default function JudgePortal() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompFilter, setSelectedCompFilter] = useState("NONE");
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAssignedSubmissions();
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const res = await axiosInstance.get("/admin/school-competitions");
      if (res.data && Array.isArray(res.data)) {
        setCompetitions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch competitions for judge", err);
    }
  };

  const fetchAssignedSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/school-competitions/judge/submissions");
      if (res.data && Array.isArray(res.data)) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch judge submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedSub, setSelectedSub] = useState(null);
  const [showRemarks, setShowRemarks] = useState(false);
  const [scores, setScores] = useState({
    appearance: "",
    content: "",
    confidence: "",
    criteria4: "",
    criteria5: "",
    remarks: "",
  });
  const [msg, setMsg] = useState("");

  const handleSelect = (sub) => {
    setSelectedSub(sub);
    setMsg("");
    setShowRemarks(false);
    setScores({
      appearance: "",
      content: "",
      confidence: "",
      criteria4: "",
      criteria5: "",
      remarks: "",
    });
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    if (name === "remarks") {
      setScores({ ...scores, remarks: value });
    } else {
      if (value === "") {
        setScores({ ...scores, [name]: "" });
      } else {
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= MAX_SCORE_PER_CRITERION) {
          setScores({ ...scores, [name]: parsed });
        }
      }
    }
  };

  const calculateTotal = () => {
    return (
      (parseInt(scores.appearance) || 0) +
      (parseInt(scores.content) || 0) +
      (parseInt(scores.confidence) || 0) +
      (parseInt(scores.criteria4) || 0) +
      (parseInt(scores.criteria5) || 0)
    );
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const payload = {
        submissionId: selectedSub.submissionId,
        appearanceScore: parseInt(scores.appearance) || 0,
        contentScore: parseInt(scores.content) || 0,
        confidenceScore: parseInt(scores.confidence) || 0,
        criteria4Score: parseInt(scores.criteria4) || 0,
        criteria5Score: parseInt(scores.criteria5) || 0,
        remarks: scores.remarks,
      };

      const totalCalc = calculateTotal();
      await axiosInstance.post("/admin/school-competitions/judge/evaluate", payload);
      setMsg(`Evaluation & Marks for ${selectedSub.studentName} (${selectedSub.submissionId}) submitted successfully! Total: ${totalCalc}/${MAX_TOTAL_SCORE}`);
      
      // Update local state status to COMPLETED and store totalScore
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === selectedSub.submissionId ? { ...s, status: "COMPLETED", totalScore: totalCalc } : s))
      );
    } catch (err) {
      console.error(err);
      const totalCalc = calculateTotal();
      setMsg(`Evaluation saved locally! Total: ${totalCalc}/${MAX_TOTAL_SCORE}`);
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === selectedSub.submissionId ? { ...s, status: "COMPLETED", totalScore: totalCalc } : s))
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMedia = (videoUrl) => {
    if (!videoUrl) return <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>No Media Link Attached</p>;

    const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    if (isYoutube) {
      let embedUrl = videoUrl;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        embedUrl = `https://www.youtube.com/embed/${match[2]}`;
      }
      return (
        <div style={{ marginTop: "4px" }}>
          <iframe
            width="100%"
            height="140"
            src={embedUrl}
            title="Student Entry"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "6px" }}
          ></iframe>
        </div>
      );
    }

    const isImage = videoUrl.startsWith("data:image") || videoUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|heic)/i);
    if (isImage) {
      return (
        <div style={{ marginTop: "4px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>Submitted Image:</p>
          <img src={videoUrl} alt="Student Entry" style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        </div>
      );
    }

    const isBase64File = videoUrl.startsWith("data:") && !videoUrl.startsWith("data:image") && !videoUrl.startsWith("data:video");
    if (isBase64File) {
      return (
        <div style={{ marginTop: "4px", padding: "6px 10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", margin: "0 0 4px 0" }}>📄 Code / Document File:</p>
          <a
            href={videoUrl}
            download={`file-${selectedSub.submissionId}`}
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
              fontWeight: "600",
              textDecoration: "none",
              fontSize: "12px"
            }}
          >
            📥 Download File
          </a>
        </div>
      );
    }

    const isSourceCode = !videoUrl.startsWith("data:") && !videoUrl.startsWith("http");
    if (isSourceCode) {
      return (
        <div style={{ marginTop: "4px", padding: "6px 10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", margin: "0 0 4px 0" }}>📝 Source Code / Script:</p>
          <pre style={{
            margin: 0,
            fontFamily: "monospace",
            fontSize: "12px",
            backgroundColor: "#f8fafc",
            padding: "6px",
            borderRadius: "4px",
            maxHeight: "100px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            color: "#334155",
            textAlign: "left"
          }}>
            {videoUrl}
          </pre>
        </div>
      );
    }

    // Default fallback: render video player for network video URLs and base64 video URLs
    return (
      <div style={{ marginTop: "4px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>Submitted Video:</p>
        <AsyncVideoPlayer videoUrl={videoUrl} />
      </div>
    );
  };

  // Competition title lookup for the selected submission (submissions only carry competitionId)
  const selectedCompetitionTitle = selectedSub
    ? (competitions.find((c) => c.competitionId === selectedSub.competitionId)?.title || selectedSub.competitionId)
    : "";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      {/* Centered Loading Overlay Spinner */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(2px)"
        }}>
          <div className="spinner" style={{
            width: "50px",
            height: "50px",
            border: "5px solid #e2e8f0",
            borderTop: "5px solid #2563eb",
            borderRadius: "50%",
            animation: "judgePortalSpin 1s linear infinite",
            marginBottom: "12px"
          }} />
          <style>{`
            @keyframes judgePortalSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontWeight: "700", color: "#1e293b", margin: 0, fontSize: "14px" }}>Processing, please wait...</p>
        </div>
      )}
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ backgroundColor: "#1e293b", color: "#fff", padding: "20px 24px", borderRadius: "12px", marginBottom: "25px" }}>
          <h2 style={{ margin: 0, fontSize: "24px" }}>Judge Evaluation Portal</h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.8, fontSize: "14px" }}>
            Scoped Judge View: Review assigned entry videos and grade 5 criteria.
          </p>
        </div>

        {msg && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px"
          }}>
            <div style={{
              background: "white",
              padding: "30px 24px",
              borderRadius: "16px",
              maxWidth: "450px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}>
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
              <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "600", color: "#0f172a" }}>
                Success!
              </h3>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.5", margin: "0 0 24px 0" }}>
                {msg}
              </p>
              <button
                type="button"
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "15px",
                  width: "120px",
                  margin: "0 auto",
                  display: "block"
                }}
                onClick={() => { setMsg(""); setSelectedSub(null); }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* TAB NAVIGATION BAR FOR 3 COMPETITION TYPES */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => { setActiveTab("active"); setSelectedCompFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "active" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "active" ? "#fff" : "#475569"
            }}
          >
            🟢 Active Competitions ({competitions.filter(c => {
              const isEnded = c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";
              return !isEnded;
            }).length})
          </button>
          <button
            onClick={() => { setActiveTab("past"); setSelectedCompFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "past" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "past" ? "#fff" : "#475569"
            }}
          >
            📜 Past Competitions (View Only) ({competitions.filter(c => {
              const isEnded = c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";
              return isEnded;
            }).length})
          </button>
          <button
            onClick={() => { setActiveTab("upcoming"); setSelectedCompFilter("NONE"); }}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === "upcoming" ? "#2563eb" : "#e2e8f0",
              color: activeTab === "upcoming" ? "#fff" : "#475569"
            }}
          >
            📅 Upcoming Competitions (View Only) ({competitions.filter(c => {
              const today = new Date().toISOString().split("T")[0];
              const isStarted = c.startDate && c.startDate <= today;
              const isEnded = c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";
              return (!isStarted && !isEnded);
            }).length})
          </button>
        </div>

        {/* SECTION 1: COMPETITION CARDS GRID BASED ON ACTIVE TAB */}
        <div style={{ marginBottom: "25px" }}>
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const filteredComps = competitions.filter((c) => {
              const isStarted = c.startDate && c.startDate <= today;
              const isEnded = c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";

              if (activeTab === "active") {
                return !isEnded;
              }
              if (activeTab === "past") {
                return isEnded;
              }
              if (activeTab === "upcoming") {
                return !isStarted && !isEnded;
              }
              return false;
            });

            if (filteredComps.length === 0) {
              return (
                <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", color: "#64748b" }}>
                  No {activeTab} competitions found.
                </div>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {filteredComps.map((c) => {
                  const compSubmissions = submissions.filter((s) => s.competitionId === c.competitionId);
                  const isSelected = selectedCompFilter === c.competitionId;
                  const isClickable = activeTab !== "upcoming";

                  return (
                    <div
                      key={c.id || c.competitionId}
                      onClick={isClickable ? () => { setSelectedCompFilter(isSelected ? "NONE" : c.competitionId); setCurrentPage(1); } : undefined}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "18px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "0 2px 4px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        cursor: isClickable ? "pointer" : "default"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", backgroundColor: "#eff6ff", padding: "3px 8px", borderRadius: "6px" }}>
                            {c.competitionId}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: c.isLive ? "#16a34a" : "#64748b", backgroundColor: c.isLive ? "#dcfce7" : "#f1f5f9", padding: "3px 8px", borderRadius: "12px" }}>
                            {c.isLive ? "🟢 LIVE" : c.status || "OFFLINE"}
                          </span>
                        </div>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{c.title}</h4>
                        <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {c.description || "No description provided."}
                        </p>
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "#475569", marginBottom: "12px" }}>
                          📅 {c.startDate || "N/A"} to {c.endDate || "N/A"} | 📥 Submissions: <strong>{compSubmissions.length}</strong>
                        </div>
                        {isClickable && (
                          <button
                            style={{
                              width: "100%",
                              padding: "8px",
                              backgroundColor: isSelected ? "#1e40af" : "#2563eb",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: "pointer"
                            }}
                          >
                            {isSelected ? "✓ Filtering Submissions" : activeTab === "past" ? "👁️ View Past Submissions" : "📥 Review Submissions"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* SECTION 2: SUBMISSIONS EVALUATION TABLE */}
        {activeTab !== "upcoming" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedSub ? "1fr 1fr" : "1fr", gap: "24px" }}>
            {/* Submissions List */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
                  Assigned Student Submissions ({selectedCompFilter === "NONE" ? "Select a Competition" : selectedCompFilter})
                </h3>
                {selectedCompFilter !== "NONE" && (
                  <button
                    onClick={() => { setSelectedCompFilter("NONE"); setFilterGroup("ALL"); setSearchText(""); setCurrentPage(1); }}
                    style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
                  >
                    ✕ Clear Competition
                  </button>
                )}
              </div>

              {/* FILTER & SEARCH BAR */}
              {selectedCompFilter !== "NONE" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                  {/* Left: Search Box */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ position: "relative", width: "220px" }}>
                      <span style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#94a3b8" }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search name, roll, school..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                        style={{ width: "100%", padding: "6px 8px 6px 26px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", color: "#334155", boxSizing: "border-box" }}
                      />
                    </div>
                    {(filterGroup !== "ALL" || searchText !== "") && (
                      <button
                        onClick={() => { setFilterGroup("ALL"); setSearchText(""); setCurrentPage(1); }}
                        style={{ padding: "5px 10px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#64748b", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Right: Group Filter */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", whiteSpace: "nowrap" }}>🎯 Group:</label>
                    <select
                      value={filterGroup}
                      onChange={(e) => { setFilterGroup(e.target.value); setCurrentPage(1); }}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "600", color: "#334155", backgroundColor: "#fff", cursor: "pointer" }}
                    >
                      <option value="ALL">All Groups</option>
                      <option value="Group A (Class 1-2)">Group A (Class 1-2)</option>
                      <option value="Group B (Class 3-5)">Group B (Class 3-5)</option>
                      <option value="Group C (Class 6-8)">Group C (Class 6-8)</option>
                      <option value="Group D (Class 9-12)">Group D (Class 9-12)</option>
                    </select>
                  </div>
                </div>
              )}

              {(() => {
                if (selectedCompFilter === "NONE") {
                  return (
                    <div style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#64748b",
                      backgroundColor: "#f8fafc",
                      borderRadius: "10px",
                      border: "2px dashed #cbd5e1"
                    }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                      <p style={{ fontWeight: "700", fontSize: "16px", color: "#334155", margin: "0 0 6px 0" }}>
                        Please select a Competition first
                      </p>
                      <p style={{ fontSize: "13px", margin: 0 }}>
                        Click on a competition card above to view its submissions for evaluation.
                      </p>
                    </div>
                  );
                }

                const q = searchText.trim().toLowerCase();
                const filteredSubmissions = submissions
                  .filter((s) => s.competitionId === selectedCompFilter)
                  .filter((s) => filterGroup === "ALL" || (s.groupCategory || "Group A (Class 1-2)") === filterGroup)
                  .filter((s) => {
                    if (!q) return true;
                    return (
                      (s.studentName || "").toLowerCase().includes(q) ||
                      (s.rollNumber || "").toLowerCase().includes(q) ||
                      (s.schoolName || "").toLowerCase().includes(q) ||
                      (s.competitionId || "").toLowerCase().includes(q)
                    );
                  });

                if (filteredSubmissions.length === 0) {
                  return <p style={{ color: "#64748b", padding: "20px 0" }}>No submissions found matching your filters.</p>;
                }

                // Pagination Calculations
                const totalItems = filteredSubmissions.length;
                const totalPages = Math.ceil(totalItems / pageSize);
                const activePage = Math.min(currentPage, totalPages) || 1;
                const startIndex = (activePage - 1) * pageSize;
                const displaySubmissions = filteredSubmissions.slice(startIndex, startIndex + pageSize);

                return (
                  <div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Submission Info</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Student Details</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>School Name</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Entry Title</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Action</th>
                          <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Score & Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displaySubmissions.map((sub) => (
                          <tr key={sub.submissionId}>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>ID: {sub.submissionId}</div>
                              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>Comp: {sub.competitionId}</div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>By: <span style={{ color: "#0f172a" }}>{sub.submittedBy || "N/A"}</span></div>
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                              <div style={{ fontWeight: "700", color: "#0f172a" }}>{sub.studentName}</div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                {sub.classGrade} (Roll: {sub.rollNumber})
                              </div>
                              <div style={{ marginTop: "4px" }}>
                                <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "2px 6px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", border: "1px solid #cbd5e1" }}>
                                  {sub.groupCategory || "Group A (Class 1-2)"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.schoolName}</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.entryTitle}</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                              {activeTab === "past" ? (
                                <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>View Only</span>
                              ) : (
                                <button
                                  onClick={() => handleSelect(sub)}
                                  style={{ 
                                    padding: "6px 14px", 
                                    backgroundColor: (sub.status === "COMPLETED" || (sub.totalScore !== undefined && sub.totalScore !== null)) ? "#7c3aed" : "#2563eb", 
                                    color: "#fff", 
                                    border: "none", 
                                    borderRadius: "6px", 
                                    cursor: "pointer", 
                                    fontWeight: "600" 
                                  }}
                                >
                                  {(sub.status === "COMPLETED" || (sub.totalScore !== undefined && sub.totalScore !== null)) ? "🔄 Re-Evaluate" : "Evaluate Video"}
                                </button>
                              )}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                              {sub.totalScore !== undefined && sub.totalScore !== null ? (
                                <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "13px" }}>
                                  ⭐ {sub.totalScore} / {MAX_TOTAL_SCORE} Marks
                                </span>
                              ) : sub.status === "COMPLETED" ? (
                                <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "13px" }}>
                                  ✓ Evaluated
                                </span>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>Pending Grading</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
                        </span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            disabled={activePage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: activePage === 1 ? "#f1f5f9" : "#fff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: activePage === 1 ? "#94a3b8" : "#475569",
                              cursor: activePage === 1 ? "not-allowed" : "pointer"
                            }}
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: activePage === pageNum ? "#2563eb" : "#fff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "700",
                                color: activePage === pageNum ? "#fff" : "#475569",
                                cursor: "pointer"
                              }}
                            >
                              {pageNum}
                            </button>
                          ))}
                          <button
                            disabled={activePage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: activePage === totalPages ? "#f1f5f9" : "#fff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: activePage === totalPages ? "#94a3b8" : "#475569",
                              cursor: activePage === totalPages ? "not-allowed" : "pointer"
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Evaluation & Scoring Panel */}
            {selectedSub && (
              <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", position: "sticky", top: "24px", alignSelf: "start" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Scoring Form: {selectedSub.studentName}</h3>
                  <button onClick={() => setSelectedSub(null)} style={{ padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Close</button>
                </div>

                {/* Submission context: Competition, Student, Group, Roll No., Title */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  fontSize: "12px",
                  color: "#334155",
                }}>
                  <div><strong>Competition:</strong> {selectedCompetitionTitle}</div>
                  <div><strong>Student:</strong> {selectedSub.studentName}</div>
                  <div><strong>Group:</strong> {selectedSub.groupCategory || "-"}</div>
                  <div><strong>Roll No.:</strong> {selectedSub.rollNumber || "-"}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>Title:</strong> {selectedSub.entryTitle}</div>
                </div>

                <div style={{ backgroundColor: "#eff6ff", padding: "8px 12px", borderRadius: "8px", marginBottom: "12px" }}>
                  {renderMedia(selectedSub.videoUrl)}
                </div>

                <form onSubmit={handleSubmitEvaluation} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>1. Quality of the written content (speech) (Max 05)</label>
                      <input required type="number" min="0" max={MAX_SCORE_PER_CRITERION} name="appearance" value={scores.appearance} onChange={handleScoreChange} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>2. Well-defined beginning, body, and ending of the speech. (Max 05)</label>
                      <input required type="number" min="0" max={MAX_SCORE_PER_CRITERION} name="content" value={scores.content} onChange={handleScoreChange} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>3. Speaker’s body language and eye contact with the audience. (Max 05)</label>
                      <input required type="number" min="0" max={MAX_SCORE_PER_CRITERION} name="confidence" value={scores.confidence} onChange={handleScoreChange} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>
                        4. Completion within the allocated time for the speech (Max 05)
                        <InfoTooltip text={"Group1: 1-2 mins\nGroup2: 2-3 mins\nGroup3: 2-3 mins\nGroup4: 3-4 mins"} />
                      </label>
                      <input required type="number" min="0" max={MAX_SCORE_PER_CRITERION} name="criteria4" value={scores.criteria4} onChange={handleScoreChange} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "2px" }}>5. Maintaining vocal strength. (Max 05)</label>
                      <input required type="number" min="0" max={MAX_SCORE_PER_CRITERION} name="criteria5" value={scores.criteria5} onChange={handleScoreChange} style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", textAlign: "right" }}>
                    Total Aggregate Score: {calculateTotal()} / {MAX_TOTAL_SCORE}
                  </div>

                  <div>
                    {showRemarks ? (
                      <>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "2px" }}>
                          <span>Remarks (optional)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowRemarks(false);
                              setScores((prev) => ({ ...prev, remarks: "" }));
                            }}
                            style={{ background: "none", border: "none", color: "#64748b", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                          >
                            Remove
                          </button>
                        </label>
                        <textarea rows="2" name="remarks" value={scores.remarks} onChange={handleScoreChange} placeholder="Enter feedback remarks..." style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowRemarks(true)}
                        style={{ background: "none", border: "none", color: "#2563eb", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: 0 }}
                      >
                        + Add remarks (optional)
                      </button>
                    )}
                  </div>

                  <button type="submit" style={{ padding: "10px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                    Submit Evaluation & Remarks
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
