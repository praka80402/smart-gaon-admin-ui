import { useEffect, useState } from "react";

import {
  getClasses,
  getSubjects,
  getChapters,
  deleteSubject,
  deleteChapter,
  updateSubject,
  updateChapter
} from "../api/api";

import "../ncert.css";

export default function ManageSyllabus() {

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  // Alert Modal
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState(""); // success | error | confirm
  const [confirmAction, setConfirmAction] = useState(null);

  /* Load Classes */
  useEffect(() => {
    getClasses().then(setClasses);
  }, []);

  /* Load Subjects */
  useEffect(() => {
    if (classId) {
      getSubjects(classId).then(setSubjects);
      setSubjectId("");
      setChapters([]);
    }
  }, [classId]);

  /* Load Chapters */
  useEffect(() => {
    if (subjectId) {
      getChapters(subjectId).then(setChapters);
    }
  }, [subjectId]);

  /* Show Alert */
  const showAlert = (msg, type = "success") => {
    setAlertMsg(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  /* Show Confirm */
  const showConfirm = (msg, action) => {
    setAlertMsg(msg);
    setAlertType("confirm");
    setConfirmAction(() => action);
    setAlertOpen(true);
  };

  /* Delete Subject */
  const removeSubject = (id) => {

    showConfirm("Are you sure you want to delete this subject?", async () => {

      try {

        await deleteSubject(id);

        showAlert("Subject deleted successfully", "success");

        getSubjects(classId).then(setSubjects);

        setSubjectId("");
        setChapters([]);

      } catch (err) {

        showAlert("Cannot delete subject. Delete chapters first.", "error");
      }
    });
  };

  /* Delete Chapter */
  const removeChapter = (id) => {

    showConfirm("Are you sure you want to delete this chapter?", async () => {

      try {

        await deleteChapter(id);

        showAlert("Chapter deleted successfully", "success");

        getChapters(subjectId).then(setChapters);

      } catch (err) {

        showAlert(
          err.message ||
          "If you want to delete, please delete URL first from NCERT syllabus list.",
          "error"
        );
      }
    });
  };

  /* Open Edit Modal */
  const openEdit = (id, name, type) => {

    setEditId(id);
    setEditName(name);
    setEditType(type);
    setShowModal(true);
  };

  /* Save Edit */
  const saveEdit = async () => {

    if (!editName.trim()) {
      showAlert("Name is required", "error");
      return;
    }

    try {

      if (editType === "subject") {
        await updateSubject(editId, editName);
        getSubjects(classId).then(setSubjects);
      }

      if (editType === "chapter") {
        await updateChapter(editId, editName);
        getChapters(subjectId).then(setChapters);
      }

      setShowModal(false);

      showAlert("Updated successfully", "success");

    } catch (err) {

      showAlert("Update failed", "error");
    }
  };

  return (
    <div className="syllabus-card">

      <h3>Manage Subjects & Chapters</h3>

      {/* ================= CLASS ================= */}
      <select
        onChange={e => {
          setClassId(e.target.value);
          setSubjectId("");
          setChapters([]);
        }}
      >
        <option value="">Select Class</option>

        {classes.map(c => (
          <option key={c.id} value={c.id}>
            Class {c.classNumber}
          </option>
        ))}
      </select>

      {/* ================= SUBJECTS ================= */}
      <h4>Subjects</h4>

      {subjects.length === 0 && (
        <p>No Subjects Found</p>
      )}

      {subjects.map(s => (

        <div
          key={s.id}
          className={`syllabus-row ${subjectId == s.id ? "syllabus-active" : ""}`}
          onClick={() => setSubjectId(s.id)}
        >

          <span>{s.name}</span>

          <div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(s.id, s.name, "subject");
              }}
            >
              Edit
            </button>

            <button
              className="syllabus-delete"
              onClick={(e) => {
                e.stopPropagation();
                removeSubject(s.id);
              }}
            >
              Delete
            </button>

          </div>

        </div>
      ))}

      {/* ================= CHAPTERS ================= */}
      {subjectId && <h4>Chapters</h4>}

      {subjectId && chapters.length === 0 && (
        <p>No Chapters Found</p>
      )}

      {chapters.map(c => (

        <div key={c.id} className="syllabus-row">

          <span>{c.name}</span>

          <div>

            <button
              onClick={() => openEdit(c.id, c.name, "chapter")}
            >
              Edit
            </button>

            <button
              className="syllabus-delete"
              onClick={() => removeChapter(c.id)}
            >
              Delete
            </button>

          </div>

        </div>
      ))}

      {/* ================= EDIT MODAL ================= */}
      {showModal && (

        <div className="syllabus-modal-bg">

          <div className="syllabus-modal">

            <h3>Edit {editType}</h3>

            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Enter name"
            />

            <div className="syllabus-modal-actions">

              <button onClick={saveEdit}>
                Save
              </button>

              <button
                className="syllabus-delete"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= ALERT MODAL ================= */}
      {alertOpen && (

        <div className="syllabus-modal-bg">

          <div className="syllabus-modal">

            <h3>
              {alertType === "success" && "Success"}
              {alertType === "error" && "Error"}
              {alertType === "confirm" && "Confirm"}
            </h3>

            <p style={{ margin: "15px 0" }}>{alertMsg}</p>

            <div className="syllabus-modal-actions">

              {alertType === "confirm" ? (
                <>
                  <button
                    onClick={() => {
                      confirmAction();
                      setAlertOpen(false);
                    }}
                  >
                    Yes
                  </button>

                  <button
                    className="syllabus-delete"
                    onClick={() => setAlertOpen(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAlertOpen(false)}
                >
                  OK
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
