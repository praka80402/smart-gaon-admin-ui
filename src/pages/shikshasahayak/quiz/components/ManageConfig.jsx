import { useState, useEffect } from "react";
import { getConfigs, createConfig, updateConfig } from "../api/quizApi";

const EMPTY = {
  competitionType: "",
  segmentType: "COMPETITION",
  questionCount: 20,
  timeLimitMinutes: 30,
  extraTimeAllowedMinutes: 5,
  dailyAttemptLimit: 2,
};

export default function ManageConfig() {
  const [configs, setConfigs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null); // null = create mode
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await getConfigs();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const edit = (c) => {
    setEditId(c.id);
    setForm({
      competitionType: c.competitionType,
      segmentType: c.segmentType,
      questionCount: c.questionCount,
      timeLimitMinutes: c.timeLimitMinutes ?? "",
      extraTimeAllowedMinutes: c.extraTimeAllowedMinutes ?? "",
      dailyAttemptLimit: c.dailyAttemptLimit ?? "",
    });
  };

  const reset = () => {
    setEditId(null);
    setForm(EMPTY);
  };

  const save = async () => {
    setMsg(null);
    if (!form.competitionType.trim()) {
      setMsg({ type: "error", text: "Competition type is required." });
      return;
    }
    const payload = {
      competitionType: form.competitionType.trim(),
      segmentType: form.segmentType,
      questionCount: Number(form.questionCount),
      timeLimitMinutes:
        form.timeLimitMinutes === "" ? null : Number(form.timeLimitMinutes),
      extraTimeAllowedMinutes:
        form.extraTimeAllowedMinutes === ""
          ? null
          : Number(form.extraTimeAllowedMinutes),
      dailyAttemptLimit:
        form.dailyAttemptLimit === "" ? null : Number(form.dailyAttemptLimit),
    };
    try {
      setBusy(true);
      if (editId) await updateConfig(editId, payload);
      else await createConfig(payload);
      setMsg({ type: "success", text: "Config saved." });
      reset();
      load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="syllabus-card">
      <div className="syllabus-header">
        <h3>Competition Config</h3>
      </div>

      {msg && (
        <div className={msg.type === "success" ? "quiz-msg-ok" : "quiz-msg-err"}>
          {msg.text}
        </div>
      )}

      {/* Existing configs */}
      {configs.length === 0 ? (
        <p className="syllabus-empty">No configs yet.</p>
      ) : (
        <table className="content-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Segment</th>
              <th>Q Count</th>
              <th>Timer</th>
              <th>Extra</th>
              <th>Daily Limit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c.id}>
                <td>{c.competitionType}</td>
                <td>{c.segmentType}</td>
                <td>{c.questionCount}</td>
                <td>{c.timeLimitMinutes ?? "—"}</td>
                <td>{c.extraTimeAllowedMinutes ?? "—"}</td>
                <td>{c.dailyAttemptLimit ?? "—"}</td>
                <td>
                  <button onClick={() => edit(c)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Form */}
      <div className="quiz-build-box">
        <h4 className="quiz-subtitle">
          {editId ? `Edit Config #${editId}` : "Add New Config"}
        </h4>
        <div className="quiz-build-grid">
          <div>
            <label className="quiz-label">Competition Type</label>
            <input
              value={form.competitionType}
              onChange={(e) => set("competitionType", e.target.value)}
              placeholder="SSC / CLASS_10 / GENERAL"
              disabled={!!editId}
            />
          </div>
          <div>
            <label className="quiz-label">Segment</label>
            <select
              value={form.segmentType}
              onChange={(e) => set("segmentType", e.target.value)}
            >
              <option value="COMPETITION">COMPETITION</option>
              <option value="ACADEMIC">ACADEMIC</option>
            </select>
          </div>
          <div>
            <label className="quiz-label">Question Count</label>
            <input
              type="number"
              value={form.questionCount}
              onChange={(e) => set("questionCount", e.target.value)}
            />
          </div>
          <div>
            <label className="quiz-label">Time Limit (min)</label>
            <input
              type="number"
              value={form.timeLimitMinutes}
              onChange={(e) => set("timeLimitMinutes", e.target.value)}
              placeholder="blank = no timer"
            />
          </div>
          <div>
            <label className="quiz-label">Extra Time (min)</label>
            <input
              type="number"
              value={form.extraTimeAllowedMinutes}
              onChange={(e) => set("extraTimeAllowedMinutes", e.target.value)}
            />
          </div>
          <div>
            <label className="quiz-label">Daily Attempt Limit</label>
            <input
              type="number"
              value={form.dailyAttemptLimit}
              onChange={(e) => set("dailyAttemptLimit", e.target.value)}
              placeholder="blank = unlimited"
            />
          </div>
        </div>

        <div className="quiz-btn-row">
          <button onClick={save} disabled={busy}>
            {busy ? "Saving..." : editId ? "Update Config" : "Add Config"}
          </button>
          {editId && (
            <button className="quiz-btn-grey" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
