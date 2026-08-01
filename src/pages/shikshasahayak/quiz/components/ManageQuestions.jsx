import { useState, useEffect } from "react";
import {
  getQuestions,
  updateQuestion,
  deleteQuestion,
  publishQuestion,
} from "../api/quizApi";

const PAGE_SIZE = 25;

export default function ManageQuestions() {
  const [segmentType, setSegmentType] = useState("COMPETITION");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);

  const [language, setLanguage] = useState("EN");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedCompType, setSelectedCompType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSet, setSelectedSet] = useState("all");

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await getQuestions(segmentType, language);
      const fetched = Array.isArray(data) ? data : [];
      setItems(fetched);
      setPage(1); // reset to first page on segment/language change
      
      setSelectedClass("all");
      setSelectedCompType("all");
      setSelectedSubject("all");
      setSelectedSet("all");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentType, language]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      setItems((list) => list.filter((q) => q.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const onPublish = async (id) => {
    try {
      const updated = await publishQuestion(id);
      setItems((list) => list.map((q) => (q.id === id ? updated : q)));
    } catch (e) {
      alert(e.message);
    }
  };

  const saveEdit = async () => {
    try {
      const updated = await updateQuestion(editing.id, editing);
      setItems((list) => list.map((q) => (q.id === editing.id ? updated : q)));
      setEditing(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const setE = (k, v) => setEditing((s) => ({ ...s, [k]: v }));

  // --- Dynamic unique options for filters ---
  const order = { "UNDER_5": 1, "6_TO_8": 2, "9_TO_12": 3 };
  const classes = Array.from(new Set(items.map((q) => q.classLevel).filter(Boolean))).sort(
    (a, b) => (order[a] || 99) - (order[b] || 99)
  );
  const compTypes = Array.from(new Set(items.map((q) => q.competitionType).filter(Boolean))).sort();

  // Apply Category / Competition Type & Language filters first before deriving unique sets and subjects
  const categoryFilteredItems = items.filter((q) => {
    const qLang = q.language ? String(q.language).toUpperCase() : "EN";
    if (qLang !== String(language).toUpperCase()) return false;

    if (segmentType === "ACADEMIC") {
      if (selectedClass !== "all" && q.classLevel !== selectedClass) return false;
    } else {
      if (selectedCompType !== "all") {
        const qComp = q.competitionType ? String(q.competitionType).toUpperCase().replace(/\s+/g, "_") : "";
        const selComp = String(selectedCompType).toUpperCase().replace(/\s+/g, "_");
        if (qComp !== selComp) return false;
      }
    }
    return true;
  });

  const subjects = Array.from(new Set(categoryFilteredItems.map((q) => q.subject).filter(Boolean))).sort();
  const sets = Array.from(
    new Set(categoryFilteredItems.map((q) => q.setNumber).filter((v) => v !== null && v !== undefined))
  ).sort((a, b) => {
    const numA = Number(a.replace("SG-", "")) || 0;
    const numB = Number(b.replace("SG-", "")) || 0;
    return numA - numB;
  });

  // Reset Set/Subject filter if it is not in the active sets/subjects list
  useEffect(() => {
    if (selectedSet !== "all" && !sets.includes(selectedSet)) {
      setSelectedSet("all");
    }
    if (selectedSubject !== "all" && !subjects.includes(selectedSubject)) {
      setSelectedSubject("all");
    }
  }, [selectedClass, selectedCompType, items]);

  // --- Filtered Items ---
  const filteredItems = items.filter((q) => {
    // 1. Strict Language Check
    const qLang = q.language ? String(q.language).toUpperCase() : "EN";
    if (qLang !== String(language).toUpperCase()) return false;

    // 2. Segment & Category Filter
    if (segmentType === "ACADEMIC") {
      if (selectedClass === "all") return false;
      if (q.classLevel !== selectedClass) return false;
    } else {
      if (selectedCompType === "all") return false;
      const qComp = q.competitionType ? String(q.competitionType).toUpperCase().replace(/\s+/g, "_") : "";
      const selComp = String(selectedCompType).toUpperCase().replace(/\s+/g, "_");
      if (qComp !== selComp) return false;
    }
    // 3. Subject Filter
    if (selectedSubject !== "all" && q.subject !== selectedSubject) return false;
    // 4. Set Filter
    if (selectedSet !== "all" && String(q.setNumber) !== selectedSet) return false;

    return true;
  });

  // ---- pagination math ----
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(start, start + PAGE_SIZE);

  return (
    <div className="syllabus-card">
      <div className="syllabus-header" style={{ display: "block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3>Manage Questions</h3>
          <div className="quiz-header-right" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {!loading && filteredItems.length > 0 && (
              <span className="quiz-count-pill">{filteredItems.length} total (filtered)</span>
            )}
          </div>
        </div>

        {/* Modern & Sleek Filter Controls Bar */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          marginBottom: "20px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            alignItems: "end"
          }}>
            {/* 1. Quiz Type */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                1. Quiz Type
              </label>
              <select
                value={segmentType}
                onChange={(e) => setSegmentType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e293b",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="COMPETITION">🏆 Competition</option>
                <option value="ACADEMIC">🎓 Academic</option>
              </select>
            </div>

            {/* 2. Competition / Class Category */}
            {segmentType === "ACADEMIC" ? (
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                  2. Class Category
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#1e293b",
                    outline: "none"
                  }}
                >
                  <option value="all">All Classes</option>
                  {classes.map((c) => {
                    const labels = {
                      "UNDER_5": "Under Class 5",
                      "6_TO_8": "Class 6 to 8",
                      "9_TO_12": "Class 9 to 12"
                    };
                    return (
                      <option key={c} value={c}>{labels[c] || c}</option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                  2. Exam Category
                </label>
                <select
                  value={selectedCompType}
                  onChange={(e) => { setSelectedCompType(e.target.value); setPage(1); }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#1e293b",
                    outline: "none"
                  }}
                >
                  <option value="all">-- Select Exam Category --</option>
                  {Array.from(new Set([...compTypes, "SSC", "BANK", "GENERAL", "STATE_EXAM"])).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Language */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                3. Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1e293b",
                  outline: "none"
                }}
              >
                <option value="EN">English (EN)</option>
                <option value="HI">Hindi (HI)</option>
                <option value="MR">Marathi (MR)</option>
              </select>
            </div>

            {/* 4. Subject */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                4. Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1e293b",
                  outline: "none"
                }}
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 5. Set Number */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>
                5. Set Number
              </label>
              <select
                value={selectedSet}
                onChange={(e) => { setSelectedSet(e.target.value); setPage(1); }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1e293b",
                  outline: "none"
                }}
              >
                <option value="all">All Sets</option>
                {sets.map((num) => (
                  <option key={num} value={num}>Set {num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {err && <div className="quiz-msg-err">{err}</div>}

      {loading ? (
        <p className="syllabus-empty">Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p className="syllabus-empty">No questions found matching the filters.</p>
      ) : (
        <>
          <div className="quiz-table-wrap">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
                  <th style={{ width: "80px" }}>Set</th>
                  <th style={{ width: "130px" }}>Subject</th>
                  <th>Question</th>
                  <th style={{ width: "80px" }}>Correct</th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((q) => (
                  <tr key={q.id}>
                    <td>{q.id}</td>
                    <td style={{ fontWeight: "bold" }}>Set {q.setNumber ?? "—"}</td>
                    <td>{q.subject}</td>
                    <td className="quiz-q-text">{q.questionText}</td>
                    <td>
                      <span className="quiz-correct-badge">{q.correctOption}</span>
                    </td>
                    <td>
                      <span
                        className={
                          q.status === "PUBLISHED"
                            ? "quiz-status quiz-status-pub"
                            : "quiz-status quiz-status-draft"
                        }
                      >
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="quiz-action-btns">
                        <button
                          className="quiz-btn-edit"
                          onClick={() => setEditing(q)}
                        >
                          Edit
                        </button>
                        {q.status !== "PUBLISHED" && (
                          <button
                            className="quiz-btn-pub"
                            onClick={() => onPublish(q.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="quiz-btn-del"
                          onClick={() => onDelete(q.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="quiz-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ‹ Prev
              </button>
              <span className="quiz-page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="syllabus-modal-bg" onClick={() => setEditing(null)}>
          <div
            className="syllabus-modal quiz-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="syllabus-modal-title">Edit Question #{editing.id}</h3>

            <label className="quiz-label">Subject</label>
            <input
              value={editing.subject || ""}
              onChange={(e) => setE("subject", e.target.value)}
            />
            <label className="quiz-label">Set Number</label>
            <input
              type="number"
              value={editing.setNumber ?? ""}
              onChange={(e) => setE("setNumber", e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 1"
            />
            <label className="quiz-label">Question</label>
            <input
              value={editing.questionText || ""}
              onChange={(e) => setE("questionText", e.target.value)}
            />
            <label className="quiz-label">Option A</label>
            <input
              value={editing.optionA || ""}
              onChange={(e) => setE("optionA", e.target.value)}
            />
            <label className="quiz-label">Option B</label>
            <input
              value={editing.optionB || ""}
              onChange={(e) => setE("optionB", e.target.value)}
            />
            <label className="quiz-label">Option C</label>
            <input
              value={editing.optionC || ""}
              onChange={(e) => setE("optionC", e.target.value)}
            />
            <label className="quiz-label">Option D</label>
            <input
              value={editing.optionD || ""}
              onChange={(e) => setE("optionD", e.target.value)}
            />
            <label className="quiz-label">Correct Option</label>
            <select
              value={editing.correctOption || "A"}
              onChange={(e) => setE("correctOption", e.target.value)}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            <div className="syllabus-modal-actions">
              <button onClick={saveEdit}>Save</button>
              <button className="syllabus-delete" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
