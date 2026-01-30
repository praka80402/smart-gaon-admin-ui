import { useEffect, useState } from "react";
import { getClasses, getSubjects, addChapter } from "../api/api";
import "../ncert.css";

export default function AddChapter({ refresh }) {

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");

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

  const handleAdd = async () => {

    if (!subjectId || !name) {
      alert("Fill all fields");
      return;
    }

    try {
      await addChapter(subjectId, name);

      alert("Chapter Added");
      setName("");

    } catch (err) {
      alert("Failed to add chapter");
    }
  };

  return (
    <div className="ncert-card">

      <h3>Add Chapter</h3>

      {/* Class */}
      <select
        onChange={e => {
          setClassId(e.target.value);
          setSubjects([]);
          setSubjectId("");
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

      {/* Chapter Name */}
      <input
        placeholder="Chapter Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <button onClick={handleAdd}>
        Add Chapter
      </button>

    </div>
  );
}
