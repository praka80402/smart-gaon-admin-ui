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

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await getQuestions(segmentType);
      setItems(Array.isArray(data) ? data : []);
      setPage(1); // reset to first page on segment change
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentType]);

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

  // ---- pagination math ----
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  return (
    <div className="syllabus-card">
      <div className="syllabus-header">
        <h3>Manage Questions</h3>
        <div className="quiz-header-right">
          {!loading && items.length > 0 && (
            <span className="quiz-count-pill">{items.length} total</span>
          )}
          <select
            className="syllabus-class-select"
            value={segmentType}
            onChange={(e) => setSegmentType(e.target.value)}
          >
            <option value="COMPETITION">Competition</option>
            <option value="ACADEMIC">Academic</option>
          </select>
        </div>
      </div>

      {err && <div className="quiz-msg-err">{err}</div>}

      {loading ? (
        <p className="syllabus-empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="syllabus-empty">No questions found for this segment.</p>
      ) : (
        <>
          <div className="quiz-table-wrap">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>ID</th>
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
