import { useEffect, useState } from "react";
import "./successStory.css";
import {
  fetchSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
} from "./successStoryService";

const STATES = ["BIHAR", "JHARKHAND", "UP", "MAHARASHTRA", "GUJARAT"];

export default function AdminSuccessStory() {
  const role = localStorage.getItem("adminRole");
  const canEdit =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [tab, setTab] = useState(canEdit ? "CREATE" : "VIEW");
  const [stories, setStories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [storyModal, setStoryModal] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    userName: "",
    story: "",
    state: "BIHAR",
    pincode: "",
    profileImage: null,
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const data = await fetchSuccessStories();
    setStories(data);
  };

  const submit = async () => {
    if (!canEdit) return;

    if (!form.title || !form.userName || !form.story || !form.pincode) {
      alert("All fields are mandatory");
      return;
    }

    if (!editId && !form.profileImage) {
      alert("Profile image is mandatory");
      return;
    }

    if (editId) {
      await updateSuccessStory(editId, form);
    } else {
      await createSuccessStory(form);
    }

    resetForm();
    setTab("VIEW");
    loadStories();
  };

  const edit = (s) => {
    if (!canEdit) return;

    setEditId(s.id);
    setTab("CREATE");

    setForm({
      title: s.title,
      userName: s.userName,
      story: s.story,
      state: s.state,
      pincode: s.pincode,
      profileImage: null,
    });
  };

  const remove = async (id) => {
    if (!canEdit) return;
    if (!window.confirm("Delete this story?")) return;

    await deleteSuccessStory(id);
    loadStories();
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: "",
      userName: "",
      story: "",
      state: "BIHAR",
      pincode: "",
      profileImage: null,
    });
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Success Story</h1>

      {/* TABS */}
      <div className="tab-buttons">
        {canEdit && (
          <button
            className={tab === "CREATE" ? "active-tab" : ""}
            onClick={() => {
              resetForm();
              setTab("CREATE");
            }}
          >
            {editId ? "Edit Story" : "Create Story"}
          </button>
        )}

        <button
          className={tab === "VIEW" ? "active-tab" : ""}
          onClick={() => setTab("VIEW")}
        >
          View Stories
        </button>
      </div>

      {/* FORM */}
      {canEdit && tab === "CREATE" && (
        <div className="form-card">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            placeholder="Name"
            value={form.userName}
            onChange={(e) =>
              setForm({ ...form, userName: e.target.value })
            }
          />

          <select
            value={form.state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value })
            }
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            placeholder="Pincode"
            maxLength={6}
            value={form.pincode}
            onChange={(e) =>
              setForm({ ...form, pincode: e.target.value })
            }
          />

          <textarea
            rows={5}
            placeholder="Write success story..."
            value={form.story}
            onChange={(e) =>
              setForm({ ...form, story: e.target.value })
            }
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, profileImage: e.target.files[0] })
            }
          />

          <button className="primary-btn" onClick={submit}>
            {editId ? "Update Story" : "Publish Story"}
          </button>
        </div>
      )}

      {/* LIST */}
      {tab === "VIEW" && (
        <>
          <div className="ss-list-header">
            <span>#</span>
            <span>Story Details</span>
            <span>State</span>
            <span>Pincode</span>
            <span>Story</span>
            <span>Image</span>
            <span>Actions</span>
          </div>

          {stories.length === 0 && (
            <div className="empty-msg">No stories found</div>
          )}

          <div className="ss-card-list">
            {stories.map((s, i) => (
              <div className="ss-card" key={s.id}>

                <div className="ss-col">
                  <span className="ss-index-pill">{i + 1}</span>
                </div>

                <div className="ss-col ss-col-details">
                  <div className="ss-icon-avatar">
                    <span>🌟</span>
                  </div>
                  <div>
                    <p className="ss-title">{s.title}</p>
                    <span className="ss-tag">{s.userName}</span>
                  </div>
                </div>

                <div className="ss-col">
                  <span className="location-pill">{s.state}</span>
                </div>

                <div className="ss-col">
                  {s.pincode}
                </div>

                <div className="ss-col">
                  <div>
                    <div className="desc-cell">{s.story}</div>

                    {s.story?.length > 80 && (
                      <button
                        className="view-btn"
                        onClick={() => setStoryModal(s)}
                      >
                        View More
                      </button>
                    )}
                  </div>
                </div>

                <div className="ss-col">
                  <button
                    className="view-image-btn"
                    onClick={() => setImageModal(s.profileImageUrl)}
                  >
                    View
                  </button>
                </div>

                <div className="ss-col ss-col-actions">
                  {canEdit ? (
                    <>
                      <button className="edit-btn" onClick={() => edit(s)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => remove(s.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* STORY MODAL */}
      {storyModal && (
        <div
          className="modal-overlay"
          onClick={() => setStoryModal(null)}
        >
          <div
            className="story-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="story-modal-close"
              onClick={() => setStoryModal(null)}
            >
              ✕
            </button>

            <div className="story-modal-img-wrap">
              <img
                src={storyModal.profileImageUrl}
                alt={storyModal.userName}
              />
            </div>

            <div className="story-modal-body">
              <h3 className="story-modal-title">{storyModal.title}</h3>
              <span className="ss-tag">{storyModal.userName}</span>
              <div className="story-modal-meta">
                <span className="location-pill">{storyModal.state}</span>
                <span className="story-modal-pin">{storyModal.pincode}</span>
              </div>
              <div className="story-modal-text">{storyModal.story}</div>
            </div>
          </div>
        </div>
      )}

    {/* IMAGE MODAL */}
{imageModal && (
  <div
    className="modal-overlay"
    onClick={() => setImageModal(null)}
  >
    <div
      className="img-modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="img-modal-close"
        onClick={() => setImageModal(null)}
      >
        ✕
      </button>

      <img
        src={imageModal}
        alt="Profile"
        className="modal-img"
      />
    </div>
  </div>
)}
    </div>
  );
}