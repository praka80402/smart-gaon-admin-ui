import { useEffect, useState } from "react";

import {
  getClasses,
  getSubjects,
  getChapters,
  addPdfUrl,
  addVideoUrl
} from "../api/api";

import "../ncert.css";

export default function UploadContent({ refresh }) {

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [type, setType] = useState("pdf");
  const [url, setUrl] = useState("");

  // Load classes
  useEffect(() => {
    getClasses().then(setClasses);
  }, []);

  // Load subjects when class OR refresh changes
  useEffect(() => {
    if (classId) {
      getSubjects(classId).then(data => {
        setSubjects(Array.isArray(data) ? data : []);
      });
    }
  }, [classId, refresh]);

  // Load chapters when subject OR refresh changes
  useEffect(() => {
    if (subjectId) {
      getChapters(subjectId).then(data => {
        setChapters(Array.isArray(data) ? data : []);
      });
    }
  }, [subjectId, refresh]);

  const handleUpload = async () => {

    if (!url || !chapterId) {
      alert("Fill all fields");
      return;
    }

    try {
      const data = new FormData();

      data.append("chapterId", chapterId);

      if (type === "pdf") {
        data.append("pdfUrl", url);
      } else {
        data.append("videoUrl", url);
      }

      if (type === "pdf") {
        await addPdfUrl(data);
      } else {
        await addVideoUrl(data);
      }

      alert("Link Saved Successfully");

      setUrl("");

    } catch (err) {
      alert("Failed to save link");
    }
  };

  return (
    <div className="ncert-card">

      <h3>Add PDF / Video Link</h3>

      {/* Class */}
      <select
        onChange={e => {
          setClassId(e.target.value);
          setSubjects([]);
          setChapters([]);
          setSubjectId("");
          setChapterId("");
        }}
      >
        <option value="">Select Class</option>

        {Array.isArray(classes) &&
          classes.map(c => (
            <option key={c.id} value={c.id}>
              Class {c.classNumber}
            </option>
          ))}
      </select>

      {/* Subject */}
      <select onChange={e => setSubjectId(e.target.value)}>
        <option value="">Select Subject</option>

        {Array.isArray(subjects) &&
          subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>

      {/* Chapter */}
      <select onChange={e => setChapterId(e.target.value)}>
        <option value="">Select Chapter</option>

        {Array.isArray(chapters) &&
          chapters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </select>

      {/* Type */}
      <select onChange={e => setType(e.target.value)}>
        <option value="pdf">PDF</option>
        <option value="video">Video</option>
      </select>

      {/* URL */}
      <input
        placeholder="Paste PDF / Video URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />

      <button onClick={handleUpload}>
        Save Link
      </button>

    </div>
  );
}
