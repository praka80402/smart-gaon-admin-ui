import { useState, useEffect } from "react";
import { getUploadHistory, downloadUploadFile, deleteUploadHistory } from "../api/quizApi";

export default function UploadHistory() {
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await getUploadHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const downloadFile = async (id, fileName) => {
    try {
      setBusy(true);
      await downloadUploadFile(id, fileName);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const deleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this upload history entry?")) return;
    try {
      setBusy(true);
      const res = await deleteUploadHistory(id);
      setMsg({ type: "success", text: res });
      loadHistory();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="syllabus-card">
      <div className="syllabus-header">
        <h3>Upload History</h3>
      </div>

      {msg && (
        <div className={msg.type === "success" ? "quiz-msg-ok" : "quiz-msg-err"}>
          {msg.text}
        </div>
      )}

      {history.length === 0 ? (
        <p className="syllabus-empty">No upload history found.</p>
      ) : (
        <div className="quiz-table-wrap">
          <table className="quiz-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>ID</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th style={{ width: "200px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.fileName}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    <button 
                      style={{ marginRight: "10px", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                      onClick={() => downloadFile(item.id, item.fileName)}
                      disabled={busy}
                    >
                      Download
                    </button>
                    <button 
                      style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                      onClick={() => deleteHistory(item.id)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
