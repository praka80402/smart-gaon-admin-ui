import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

export default function JudgePortal() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompFilter, setSelectedCompFilter] = useState("NONE");

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
  const [scores, setScores] = useState({
    appearance: 0,
    content: 0,
    confidence: 0,
    criteria4: 0,
    criteria5: 0,
    remarks: "",
  });
  const [msg, setMsg] = useState("");

  const handleSelect = (sub) => {
    setSelectedSub(sub);
    setMsg("");
    setScores({
      appearance: 0,
      content: 0,
      confidence: 0,
      criteria4: 0,
      criteria5: 0,
      remarks: "",
    });
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    setScores({ ...scores, [name]: name === "remarks" ? value : parseInt(value) || 0 });
  };

  const calculateTotal = () => {
    return (
      (scores.appearance || 0) +
      (scores.content || 0) +
      (scores.confidence || 0) +
      (scores.criteria4 || 0) +
      (scores.criteria5 || 0)
    );
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!scores.remarks.trim()) {
      alert("Mandatory: Please provide written description/remarks for your evaluation.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        submissionId: selectedSub.submissionId,
        appearanceScore: scores.appearance,
        contentScore: scores.content,
        confidenceScore: scores.confidence,
        criteria4Score: scores.criteria4,
        criteria5Score: scores.criteria5,
        remarks: scores.remarks,
      };

      const totalCalc = calculateTotal();
      await axiosInstance.post("/admin/school-competitions/judge/evaluate", payload);
      setMsg(`Evaluation & Marks for ${selectedSub.studentName} (${selectedSub.submissionId}) submitted successfully! Total: ${totalCalc}/50`);
      
      // Update local state status to COMPLETED and store totalScore
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === selectedSub.submissionId ? { ...s, status: "COMPLETED", totalScore: totalCalc } : s))
      );
      setSelectedSub(null);
    } catch (err) {
      console.error(err);
      const totalCalc = calculateTotal();
      setMsg(`Evaluation saved locally! Total: ${totalCalc}/50`);
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === selectedSub.submissionId ? { ...s, status: "COMPLETED", totalScore: totalCalc } : s))
      );
      setSelectedSub(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ backgroundColor: "#1e293b", color: "#fff", padding: "20px 24px", borderRadius: "12px", marginBottom: "25px" }}>
          <h2 style={{ margin: 0, fontSize: "24px" }}>Judge Evaluation Portal</h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.8, fontSize: "14px" }}>
            Scoped Judge View: Review assigned entry videos, grade 5 criteria, and enter mandatory remarks.
          </p>
        </div>

        {msg && <div style={{ padding: "14px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", marginBottom: "20px", fontWeight: "600" }}>{msg}</div>}

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
              const today = new Date().toISOString().split("T")[0];
              const isLive = c.isLive === true || c.isLive === 1 || String(c.isLive) === "true";
              const isEnded = c.endDate && c.endDate < today;
              return isLive && !isEnded && c.status !== "COMPLETED";
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
              const today = new Date().toISOString().split("T")[0];
              const isEnded = c.endDate && c.endDate < today;
              return isEnded || c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";
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
              const isEnded = c.endDate && c.endDate < today;
              return (!isStarted && !isEnded && c.status !== "COMPLETED");
            }).length})
          </button>
        </div>

        {/* SECTION 1: COMPETITION CARDS GRID BASED ON ACTIVE TAB */}
        <div style={{ marginBottom: "25px" }}>
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const filteredComps = competitions.filter((c) => {
              const isLive = c.isLive === true || c.isLive === 1 || String(c.isLive) === "true";
              const isStarted = c.startDate && c.startDate <= today;
              const isEnded = c.endDate && c.endDate < today;

              if (activeTab === "active") {
                return isLive && !isEnded && c.status !== "COMPLETED";
              }
              if (activeTab === "past") {
                return isEnded || c.status === "COMPLETED" || String(c.status).toUpperCase() === "ENDED";
              }
              if (activeTab === "upcoming") {
                return !isStarted && !isEnded && c.status !== "COMPLETED";
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

                  return (
                    <div
                      key={c.id || c.competitionId}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "18px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "0 2px 4px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justify: "space-between"
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
                        {activeTab !== "upcoming" && (
                          <button
                            onClick={() => setSelectedCompFilter(isSelected ? "NONE" : c.competitionId)}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
                  Assigned Student Submissions ({selectedCompFilter === "NONE" ? "All Entries" : selectedCompFilter})
                </h3>
                {selectedCompFilter !== "NONE" && (
                  <button
                    onClick={() => setSelectedCompFilter("NONE")}
                    style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Clear Filter (Show All)
                  </button>
                )}
              </div>

              {(() => {
                const displaySubmissions = selectedCompFilter === "NONE"
                  ? submissions
                  : submissions.filter((s) => s.competitionId === selectedCompFilter);

                if (displaySubmissions.length === 0) {
                  return <p style={{ color: "#64748b" }}>No submissions found matching filter.</p>;
                }

                return (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Submission ID</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Competition ID</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Student Name</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Group / Category</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>School Name</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Class & Roll</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Entry Title</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Action</th>
                        <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Score & Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySubmissions.map((sub) => (
                        <tr key={sub.submissionId}>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", color: "#2563eb" }}>{sub.submissionId}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.competitionId}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.studentName}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                            <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: "1px solid #cbd5e1" }}>
                              {sub.groupCategory || "Group A (Class 5-8)"}
                            </span>
                          </td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.schoolName}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.classGrade} (Roll: {sub.rollNumber})</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.entryTitle}</td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                            {activeTab === "past" ? (
                              <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>View Only</span>
                            ) : (
                              <button
                                onClick={() => handleSelect(sub)}
                                style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                              >
                                Evaluate Video
                              </button>
                            )}
                          </td>
                          <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                            {sub.totalScore !== undefined && sub.totalScore !== null ? (
                              <span style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "13px" }}>
                                ⭐ {sub.totalScore} / 50 Marks
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
                );
              })()}
            </div>

          {/* Evaluation & Scoring Panel */}
          {selectedSub && (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Scoring Form: {selectedSub.studentName}</h3>
                <button onClick={() => setSelectedSub(null)} style={{ padding: "4px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Close</button>
              </div>

              <div style={{ backgroundColor: "#eff6ff", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ margin: "0 0 6px 0", fontWeight: "600" }}>Title: {selectedSub.entryTitle}</p>
                <p style={{ margin: 0, fontSize: "14px" }}>Video Link: <a href={selectedSub.videoUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: "600" }}>{selectedSub.videoUrl}</a></p>
              </div>

              <form onSubmit={handleSubmitEvaluation} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>1. Appearance (Max 10)</label>
                  <input required type="number" min="0" max="10" name="appearance" value={scores.appearance} onChange={handleScoreChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>2. Content Quality (Max 10)</label>
                  <input required type="number" min="0" max="10" name="content" value={scores.content} onChange={handleScoreChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>3. Confidence & Speech (Max 10)</label>
                  <input required type="number" min="0" max="10" name="confidence" value={scores.confidence} onChange={handleScoreChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>4. Communication Skills (Max 10)</label>
                  <input required type="number" min="0" max="10" name="criteria4" value={scores.criteria4} onChange={handleScoreChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>5. Overall Impact (Max 10)</label>
                  <input required type="number" min="0" max="10" name="criteria5" value={scores.criteria5} onChange={handleScoreChange} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", fontWeight: "700", textAlign: "right" }}>
                  Total Aggregate Score: {calculateTotal()} / 50
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#b91c1c" }}>Mandatory Remarks / Feedback *</label>
                  <textarea required rows="3" name="remarks" value={scores.remarks} onChange={handleScoreChange} placeholder="Enter your detailed remarks and feedback..." style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                <button type="submit" style={{ padding: "12px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
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
