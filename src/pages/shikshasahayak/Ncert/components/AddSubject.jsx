import { useEffect, useState } from "react";
import { getClasses, addSubject } from "../api/api";
import "../ncert.css";

export default function AddSubject({ onAdded }) {

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    getClasses().then(setClasses);
  }, []);

  const handleAdd = async () => {

    if (!classId || !name) {
      alert("Fill all fields");
      return;
    }

    try {
      await addSubject(classId, name);

      alert("Subject Added");
      setName("");
      onAdded(); // 🔥 refresh other tabs

    } catch (err) {
      alert("Failed to add subject");
    }
  };

  return (
    <div className="ncert-card">

      <h3>Add Subject</h3>

      <select onChange={e => setClassId(e.target.value)}>
        <option value="">Select Class</option>

        {Array.isArray(classes) &&
          classes.map(c => (
            <option key={c.id} value={c.id}>
              Class {c.classNumber}
            </option>
          ))}
      </select>

      <input
        placeholder="Subject Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <button onClick={handleAdd}>
        Add Subject
      </button>

    </div>
  );
}
