import { useState } from "react";
import { uploadQuestionsExcel, downloadSampleTemplate } from "../api/quizApi";

export default function UploadQuestions() {
  const [file, setFile] = useState(null);
  const [segmentType, setSegmentType] = useState("COMPETITION");
  const [classLevel, setClassLevel] = useState("");
  const [competitionType, setCompetitionType] = useState("SSC");
  const [language, setLanguage] = useState("EN");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const isAcademic = segmentType === "ACADEMIC";

  const downloadTemplate = async () => {
    try {
      setBusy(true);
      await downloadSampleTemplate();
    } catch (e) {
      setErr("Failed to download template: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    setErr(null);
    setResult(null);
    if (!file) {
      setErr("Please choose an .xlsx file first.");
      return;
    }
    if (isAcademic && !classLevel) {
      setErr("Please select a target class level.");
      return;
    }
    if (!isAcademic && !competitionType) {
      setErr("Please select a target competition type.");
      return;
    }

    try {
      setBusy(true);
      const res = await uploadQuestionsExcel(
        file,
        segmentType,
        isAcademic ? classLevel : null,
        isAcademic ? null : competitionType,
        language
      );
      setResult(res);
      setFile(null);
      // reset the file input
      const input = document.getElementById("quiz-xlsx-input");
      if (input) input.value = "";
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="quiz-card quiz-card-wide">
      <h3>Upload Questions (Excel)</h3>

      <div style={{ marginBottom: "20px" }}>
        <label className="quiz-label">Select Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
        >
          <option value="EN">English (EN)</option>
          <option value="HI">Hindi (HI)</option>
          <option value="MR">Marathi (MR)</option>
        </select>

        <label className="quiz-label">Select Segment</label>
        <select
          value={segmentType}
          onChange={(e) => setSegmentType(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
        >
          <option value="COMPETITION">Competition</option>
          <option value="ACADEMIC">Academic</option>
        </select>

        {isAcademic ? (
          <>
            <label className="quiz-label">Class Category</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
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
              value={competitionType}
              onChange={(e) => setCompetitionType(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", marginBottom: "15px" }}
            >
              <option value="SSC">SSC</option>
              <option value="RAILWAY">RAILWAY</option>
              <option value="BANK">BANK</option>
              <option value="GENERAL">GENERAL</option>
              <option value="STATE_EXAM">STATE_EXAM</option>
            </select>
          </>
        )}
      </div>

      <p className="quiz-help">
        Excel me row 1 header hona chahiye, exactly ye columns:
      </p>
      <div className="quiz-format">
        subject | question | optionA | optionB | optionC | optionD | correct | difficulty | sourceRef
      </div>
      <p className="quiz-help" style={{ marginTop: "10px" }}>
        <b>correct</b> column me sirf A / B / C / D likho. Duplicate questions
        apne aap skip ho jaate hain.
      </p>

      <input
        id="quiz-xlsx-input"
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "block", marginBottom: "15px" }}
      />

      {err && <div className="quiz-msg-err" style={{ marginBottom: "15px" }}>{err}</div>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={upload} disabled={busy}>
          {busy ? "Uploading..." : "Upload"}
        </button>
        <button onClick={downloadTemplate} disabled={busy} style={{ backgroundColor: "#6c757d", color: "white" }}>
          Download Sample Template
        </button>
      </div>

      {result && (
        <div className="quiz-upload-result">
          <div className="quiz-result-row">
            <span>Inserted</span>
            <b className="quiz-ok-text">{result.inserted}</b>
          </div>
          <div className="quiz-result-row">
            <span>Duplicates skipped</span>
            <b>{result.duplicatesSkipped}</b>
          </div>
          <div className="quiz-result-row">
            <span>Invalid rows skipped</span>
            <b className="quiz-err-text">{result.invalidRowsSkipped}</b>
          </div>
          <p className="quiz-result-msg">{result.message}</p>
        </div>
      )}
    </div>
  );
}
