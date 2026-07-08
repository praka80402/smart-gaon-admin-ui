import { useState } from "react";
import { findDuplicates, resolveDuplicates } from "../api/quizApi";

export default function ResolveDuplicates() {
  const [segmentType, setSegmentType] = useState("COMPETITION");
  const [subject, setSubject] = useState("");
  const [groups, setGroups] = useState([]);
  const [searched, setSearched] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setMsg(null);
    if (!subject.trim()) {
      setMsg({ type: "error", text: "Enter a subject to search." });
      return;
    }
    try {
      setBusy(true);
      const data = await findDuplicates(segmentType, subject.trim());
      setGroups(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const keepOne = async (keepId, group) => {
    const groupIds = group.questions.map((q) => q.id);
    if (
      !window.confirm(
        `Keep question #${keepId} and delete the other ${groupIds.length - 1}?`
      )
    )
      return;
    try {
      await resolveDuplicates(keepId, groupIds);
      setGroups((gs) => gs.filter((g) => g !== group));
      setMsg({ type: "success", text: `Kept #${keepId}, duplicates removed.` });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  return (
    <div className="syllabus-card">
      <div className="syllabus-header">
        <h3>Find &amp; Resolve Duplicates</h3>
      </div>

      {/* Search bar */}
      <div className="quiz-dup-search">
        <div className="quiz-dup-field">
          <label className="quiz-label">Segment</label>
          <select
            value={segmentType}
            onChange={(e) => setSegmentType(e.target.value)}
          >
            <option value="COMPETITION">Competition</option>
            <option value="ACADEMIC">Academic</option>
          </select>
        </div>
        <div className="quiz-dup-field quiz-dup-field-grow">
          <label className="quiz-label">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. GK"
          />
        </div>
        <button className="quiz-dup-search-btn" onClick={search} disabled={busy}>
          {busy ? "Searching..." : "Find Duplicates"}
        </button>
      </div>

      {msg && (
        <div className={msg.type === "success" ? "quiz-msg-ok" : "quiz-msg-err"}>
          {msg.text}
        </div>
      )}

      {searched && groups.length === 0 && (
        <div className="quiz-dup-empty">
          <span className="quiz-dup-empty-icon">✓</span>
          <p>No duplicate groups found. Everything looks clean!</p>
        </div>
      )}

      {groups.length > 0 && (
        <p className="quiz-help">
          Found <b>{groups.length}</b> duplicate group
          {groups.length > 1 ? "s" : ""}. Keep one question from each group and
          remove the rest.
        </p>
      )}

      {groups.map((group, gi) => (
        <div key={gi} className="quiz-dup-group">
          <div className="quiz-dup-head">
            <span className="quiz-dup-head-badge">{gi + 1}</span>
            Duplicate Group
            <span className="quiz-dup-head-count">
              {group.questions.length} similar
            </span>
          </div>

          {group.questions.map((q) => (
            <div key={q.id} className="quiz-dup-row">
              <div className="quiz-dup-text">
                <span className="quiz-dup-id">#{q.id}</span>
                <span className="quiz-dup-qtext">{q.questionText}</span>
                {q.similarityScore > 0 && (
                  <span className="quiz-dup-match">
                    {Math.round(q.similarityScore * 100)}% match
                  </span>
                )}
              </div>
              <button
                className="quiz-dup-keep-btn"
                onClick={() => keepOne(q.id, group)}
              >
                Keep this
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
