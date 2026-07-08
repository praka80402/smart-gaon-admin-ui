import { useState, useEffect } from "react";
import {
  getStock,
  buildBatches,
  getBatches,
  rotateBatch,
  getBatchesNeeded,
} from "../api/quizApi";

const PAGE_SIZE = 25;

const statusClass = (status) => {
  if (status === "ACTIVE") return "quiz-status quiz-status-active";
  if (status === "EXPIRED") return "quiz-status quiz-status-expired";
  return "quiz-status quiz-status-sched"; // SCHEDULED
};

const stockColor = (displayColor) => {
  if (displayColor === "RED") return "quiz-stock-red";
  if (displayColor === "ORANGE") return "quiz-stock-orange";
  return "quiz-stock-green";
};

export default function ManageBatches() {
  const [stock, setStock] = useState([]);
  const [segmentKey, setSegmentKey] = useState("SSC");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(2);
  const [autoFill, setAutoFill] = useState(true);
  const [needed, setNeeded] = useState(null);
  const [batches, setBatches] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);

  const loadStock = async () => {
    try {
      setStock(await getStock());
    } catch (e) {
      /* non-critical */
    }
  };

  const loadBatches = async () => {
    try {
      const data = await getBatches(segmentKey);
      setBatches(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentKey]);

  useEffect(() => {
    getBatchesNeeded(days)
      .then(setNeeded)
      .catch(() => setNeeded(null));
  }, [days]);

  const build = async () => {
    setMsg(null);
    if (!startDate) {
      setMsg({ type: "error", text: "Please pick a start date." });
      return;
    }
    try {
      setBusy(true);
      await buildBatches({ segmentKey, startDate, days: Number(days), autoFill });
      setMsg({ type: "success", text: "Batches built successfully." });
      loadBatches();
      loadStock();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const rotate = async () => {
    setMsg(null);
    try {
      setBusy(true);
      const res = await rotateBatch(segmentKey);
      setMsg({ type: "success", text: `Batch #${res.id} is now ${res.status}.` });
      loadBatches();
      loadStock();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  // ---- pagination ----
  const totalPages = Math.max(1, Math.ceil(batches.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = batches.slice(start, start + PAGE_SIZE);

  return (
    <div className="syllabus-card">
      <div className="syllabus-header">
        <h3>Batch Management</h3>
      </div>

      {/* Stock cards */}
      {stock.length > 0 && (
        <div className="quiz-stock-row">
          {stock.map((s) => (
            <div
              key={s.segmentKey}
              className={`quiz-stock-card ${stockColor(s.displayColor)}`}
            >
              <div className="quiz-stock-seg">{s.segmentKey}</div>
              <div className="quiz-stock-days">{s.daysOfStock} days stock</div>
              <div className="quiz-stock-status">{s.status}</div>
            </div>
          ))}
        </div>
      )}

      {msg && (
        <div className={msg.type === "success" ? "quiz-msg-ok" : "quiz-msg-err"}>
          {msg.text}
        </div>
      )}

      {/* Build form */}
      <div className="quiz-build-box">
        <div className="quiz-build-grid">
          <div>
            <label className="quiz-label">Segment Key</label>
            <input
              value={segmentKey}
              onChange={(e) => setSegmentKey(e.target.value)}
              placeholder="e.g. SSC"
            />
          </div>
          <div>
            <label className="quiz-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="quiz-label">Days</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="quiz-checkbox-wrap">
            <label className="quiz-label">Auto Fill</label>
            <input
              type="checkbox"
              checked={autoFill}
              onChange={(e) => setAutoFill(e.target.checked)}
            />
          </div>
        </div>

        {needed != null && (
          <p className="quiz-help">
            {days} din = <b>{needed}</b> batches (6 slots/day).
          </p>
        )}

        <div className="quiz-btn-row">
          <button onClick={build} disabled={busy}>
            {busy ? "Working..." : "Build Batches"}
          </button>
          <button className="quiz-btn-amber" onClick={rotate} disabled={busy}>
            Rotate Now
          </button>
        </div>
      </div>

      {/* Batch list */}
      {batches.length === 0 ? (
        <p className="syllabus-empty">No batches for this segment yet.</p>
      ) : (
        <>
          <div className="quiz-list-head">
            <span className="quiz-count-pill">{batches.length} total</span>
          </div>
          <div className="quiz-table-wrap">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>ID</th>
                  <th>Slot Time</th>
                  <th style={{ width: "130px" }}>Status</th>
                  <th style={{ width: "110px" }}>Questions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{(b.scheduledSlotTime || "").replace("T", " ")}</td>
                    <td>
                      <span className={statusClass(b.status)}>{b.status}</span>
                    </td>
                    <td>{(b.questionIds || []).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  );
}
