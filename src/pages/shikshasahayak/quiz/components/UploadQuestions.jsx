import { useState } from "react";
import { uploadQuestionsExcel } from "../api/quizApi";

export default function UploadQuestions() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const upload = async () => {
    setErr(null);
    setResult(null);
    if (!file) {
      setErr("Please choose an .xlsx file first.");
      return;
    }
    try {
      setBusy(true);
      const res = await uploadQuestionsExcel(file);
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

      <p className="quiz-help">
        Excel me row 1 header hona chahiye, exactly ye columns:
      </p>
      <div className="quiz-format">
        class/competition | subject | question | optionA | optionB | optionC |
        optionD | correct
      </div>
      <p className="quiz-help">
        <b>correct</b> column me sirf A / B / C / D likho. Duplicate questions
        apne aap skip ho jaate hain.
      </p>

      <input
        id="quiz-xlsx-input"
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {err && <div className="quiz-msg-err">{err}</div>}

      <button onClick={upload} disabled={busy}>
        {busy ? "Uploading..." : "Upload"}
      </button>

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
