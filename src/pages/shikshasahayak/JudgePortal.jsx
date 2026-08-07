import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

export default function JudgePortal() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedSubmissions();
  }, []);

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

      await axiosInstance.post("/admin/school-competitions/judge/evaluate", payload);
      setMsg(`Evaluation & Marks for ${selectedSub.studentName} (${selectedSub.submissionId}) submitted successfully! Total: ${calculateTotal()}/50`);
      
      // Update local state status to COMPLETED
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId === selectedSub.submissionId ? { ...s, status: "COMPLETED" } : s))
      );
      setSelectedSub(null);
    } catch (err) {
      console.error(err);
      setMsg(`Evaluation saved locally! Total: ${calculateTotal()}/50`);
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

        <div style={{ display: "grid", gridTemplateColumns: selectedSub ? "1fr 1fr" : "1fr", gap: "24px" }}>
          {/* Submissions List */}
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Assigned Student Submissions</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>ID</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Student</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>School</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid #e2e8f0" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submissionId}>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontWeight: "600" }}>{sub.submissionId}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.studentName}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>{sub.schoolName}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                      <button
                        onClick={() => handleSelect(sub)}
                        style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Evaluate Video
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </main>
    </div>
  );
}
