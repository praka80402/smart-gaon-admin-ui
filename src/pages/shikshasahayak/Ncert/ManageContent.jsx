import { useEffect, useState } from "react";

import {
  getClasses,
  getSubjects,
  getChapters,
  searchContent,
  deletePdf,
  deleteVideo,
  updatePdf,
  updateVideo
} from "./api/api";

import "./list.css";

export default function ManageContent() {

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const [pdfs, setPdfs] = useState([]);
  const [videos, setVideos] = useState([]);

  const [pdfPages, setPdfPages] = useState(0);
  const [videoPages, setVideoPages] = useState(0);

  const [page, setPage] = useState(0);

  const [activeTab, setActiveTab] = useState("pdf");

  // Edit Modal
const [showModal, setShowModal] = useState(false);
const [editType, setEditType] = useState("");
const [editId, setEditId] = useState(null);
const [editUrl, setEditUrl] = useState("");



  /* Load classes */
  useEffect(() => {
    getClasses().then(setClasses);
  }, []);


  /* Load subjects */
  useEffect(() => {
    if (classId) {
      getSubjects(classId).then(setSubjects);
    }
  }, [classId]);


  /* Load chapters */
  useEffect(() => {
    if (subjectId) {
      getChapters(subjectId).then(setChapters);
    }
  }, [subjectId]);


  /* Search */
  const handleSearch = async (pageNo = 0) => {

    if (!classId || !subjectId || !chapterId) {
      alert("Select all fields");
      return;
    }

    try {

      const res = await searchContent(
        classId,
        subjectId,
        chapterId,
        pageNo
      );

      // PDF
      setPdfs(res.pdfs?.content || []);
      setPdfPages(res.pdfs?.totalPages || 0);

      // Video
      setVideos(res.videos?.content || []);
      setVideoPages(res.videos?.totalPages || 0);

      setPage(pageNo);

    } catch (err) {

      console.error(err);
      alert("Search failed");

    }
  };


  /* Delete */
  const removePdf = async (id) => {

    if (!window.confirm("Delete PDF?")) return;

    await deletePdf(id);

    handleSearch(page);
  };


  const removeVideo = async (id) => {

    if (!window.confirm("Delete Video?")) return;

    await deleteVideo(id);

    handleSearch(page);
  };


// Open Edit Modal
const openEditModal = (id, url, type) => {
  setEditId(id);
  setEditUrl(url);
  setEditType(type);
  setShowModal(true);
};

// Save Edit
const saveEdit = async () => {

  if (!editUrl.trim()) {
    alert("URL is required");
    return;
  }

  try {

    if (editType === "pdf") {
      await updatePdf(editId, editUrl);
    } else {
      await updateVideo(editId, editUrl);
    }

    setShowModal(false);
    handleSearch(page);

  } catch (err) {
    alert("Update failed");
  }
};


  return (
    <div className="ncert-card">

      <h3>Manage Content</h3>

      {/* Search */}
      <div className="search-row">

        <select onChange={e => setClassId(e.target.value)}>
          <option value="">Class</option>

          {classes.map(c => (
            <option key={c.id} value={c.id}>
              Class {c.classNumber}
            </option>
          ))}
        </select>


        <select onChange={e => setSubjectId(e.target.value)}>
          <option value="">Subject</option>

          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>


        <select onChange={e => setChapterId(e.target.value)}>
          <option value="">Chapter</option>

          {chapters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>


        <button onClick={() => handleSearch(0)}>
          Search
        </button>

      </div>


      {/* Tabs */}
      <div className="inner-tabs">

        <button
          className={activeTab === "pdf" ? "active" : ""}
          onClick={() => {
            setActiveTab("pdf");
            setPage(0);
            handleSearch(0);
          }}
        >
          PDF Content
        </button>


        <button
          className={activeTab === "video" ? "active" : ""}
          onClick={() => {
            setActiveTab("video");
            setPage(0);
            handleSearch(0);
          }}
        >
          Video Content
        </button>

      </div>


      {/* ================= PDF TABLE ================= */}
      {activeTab === "pdf" && (

        <table className="content-table">

          <thead>
            <tr>
              <th>#</th>
              <th>PDF URL</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {pdfs.length === 0 && (
              <tr>
                <td colSpan="3" align="center">No PDFs Found</td>
              </tr>
            )}

            {pdfs.map((p, i) => (

              <tr key={p.id}>

                <td>{i + 1}</td>

                <td className="link-cell">
                  <a href={p.pdfUrl} target="_blank" rel="noreferrer">
                    {p.pdfUrl}
                  </a>
                </td>

                <td>

                 <button onClick={() => openEditModal(p.id, p.pdfUrl, "pdf")}>
  Edit
</button>


                  <button
                    className="danger"
                    onClick={() => removePdf(p.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}


      {/* ================= VIDEO TABLE ================= */}
      {activeTab === "video" && (

        <table className="content-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Video URL</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {videos.length === 0 && (
              <tr>
                <td colSpan="3" align="center">No Videos Found</td>
              </tr>
            )}

            {videos.map((v, i) => (

              <tr key={v.id}>

                <td>{i + 1}</td>

                <td className="link-cell">
                  <a href={v.videoUrl} target="_blank" rel="noreferrer">
                    {v.videoUrl}
                  </a>
                </td>

                <td>

                 <button onClick={() => openEditModal(v.id, v.videoUrl, "video")}>
  Edit
</button>


                  <button
                    className="danger"
                    onClick={() => removeVideo(v.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}


      {/* ================= PAGINATION ================= */}
      <div className="pagination">

        <button
          disabled={page === 0}
          onClick={() => handleSearch(page - 1)}
        >
          Prev
        </button>


        <span>
          Page {page + 1} /{" "}
          {activeTab === "pdf" ? pdfPages : videoPages}
        </span>


        <button
          disabled={
            page + 1 >=
            (activeTab === "pdf" ? pdfPages : videoPages)
          }
          onClick={() => handleSearch(page + 1)}
        >
          Next
        </button>

      </div>

      {/* ================= EDIT MODAL ================= */}
{showModal && (

  <div className="edit-modal-overlay">

    <div className="edit-modal">

      <h3>Edit {editType.toUpperCase()} URL</h3>

      <input
        type="text"
        value={editUrl}
        onChange={e => setEditUrl(e.target.value)}
        placeholder="Enter new URL"
      />

      <div className="modal-actions">

        <button onClick={saveEdit}>
          Save
        </button>

        <button
          className="danger"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}


    </div>
  );
}
