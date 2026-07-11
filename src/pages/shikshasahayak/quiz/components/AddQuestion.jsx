import { useState } from "react";
import { createQuestion } from "../api/quizApi";

const EMPTY = {
  segmentType: "COMPETITION",
  competitionType: "SSC",
  classLevel: "",
  subject: "",
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  difficulty: "",
};

export default function AddQuestion() {
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isAcademic = form.segmentType === "ACADEMIC";

  const save = async () => {
    setMsg(null);

    if (!form.subject.trim() || !form.questionText.trim()) {
      setMsg({ type: "error", text: "Subject and Question are required." });
      return;
    }
    if (!form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      setMsg({ type: "error", text: "All four options are required." });
      return;
    }

    // build payload: academic uses classLevel, competition uses competitionType
    const payload = {
      segmentType: form.segmentType,
      subject: form.subject.trim(),
      questionText: form.questionText.trim(),
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctOption: form.correctOption,
      difficulty: form.difficulty || null,
    };
    if (isAcademic) payload.classLevel = form.classLevel;
    else payload.competitionType = form.competitionType;

    try {
      setSaving(true);
      await createQuestion(payload);
      setMsg({ type: "success", text: "Question added successfully." });
      setForm((f) => ({
        ...EMPTY,
        segmentType: f.segmentType,
        competitionType: f.competitionType,
        classLevel: f.classLevel,
        subject: f.subject, // keep subject for fast multi-add
      }));
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="quiz-card">
      <h3>Add Question</h3>

      {msg && (
        <div className={msg.type === "success" ? "quiz-msg-ok" : "quiz-msg-err"}>
          {msg.text}
        </div>
      )}

      <label className="quiz-label">Segment</label>
      <select
        value={form.segmentType}
        onChange={(e) => set("segmentType", e.target.value)}
      >
        <option value="COMPETITION">Competition</option>
        <option value="ACADEMIC">Academic</option>
      </select>

      {isAcademic ? (
        <>
          <label className="quiz-label">Class Category</label>
          <select
            value={form.classLevel}
            onChange={(e) => set("classLevel", e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="UNDER_5">Under Class 5</option>
            <option value="6_TO_8">Class 6 to 8</option>
            <option value="9_TO_12">Class 9 to 12</option>
          </select>
        </>
      ) : (
        <>
          <label className="quiz-label">Competition Type</label>
          <select
            value={form.competitionType}
            onChange={(e) => set("competitionType", e.target.value)}
          >
            <option value="SSC">SSC</option>
            <option value="RAILWAY">RAILWAY</option>
            <option value="BANK">BANK</option>
            <option value="GENERAL">GENERAL</option>
            <option value="STATE_EXAM">STATE_EXAM</option>
          </select>
        </>
      )}

      <label className="quiz-label">Subject</label>
      <input
        placeholder="e.g. GK"
        value={form.subject}
        onChange={(e) => set("subject", e.target.value)}
      />

      <label className="quiz-label">Question</label>
      <input
        placeholder="Question text"
        value={form.questionText}
        onChange={(e) => set("questionText", e.target.value)}
      />

      <label className="quiz-label">Option A</label>
      <input value={form.optionA} onChange={(e) => set("optionA", e.target.value)} />
      <label className="quiz-label">Option B</label>
      <input value={form.optionB} onChange={(e) => set("optionB", e.target.value)} />
      <label className="quiz-label">Option C</label>
      <input value={form.optionC} onChange={(e) => set("optionC", e.target.value)} />
      <label className="quiz-label">Option D</label>
      <input value={form.optionD} onChange={(e) => set("optionD", e.target.value)} />

      <label className="quiz-label">Correct Option</label>
      <select
        value={form.correctOption}
        onChange={(e) => set("correctOption", e.target.value)}
      >
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>

      <label className="quiz-label">Difficulty (optional)</label>
      <select
        value={form.difficulty}
        onChange={(e) => set("difficulty", e.target.value)}
      >
        <option value="">—</option>
        <option value="EASY">EASY</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HARD">HARD</option>
      </select>

      <button onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Add Question"}
      </button>
    </div>
  );
}
