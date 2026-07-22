import { useEffect, useState } from "react";
import {
  getAllDevelopments,
  createDevelopment,
  updateDevelopment,
  deleteDevelopment,
} from "./services/developmentService";
import { fileToBase64 } from "./services/config";
import { Toast } from "./ui";
import "./admin.css";

function emptyForm() {
  return {
    id: null,
    phaseNumber: 1,
    title: "",
    description: "",
    image: "", // base64 data URL
  };
}

export default function DevelopmentCatalogue() {
  const [developments, setDevelopments] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getAllDevelopments();
      setDevelopments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleImage(e) {
    const file = e.target.files[0];
    if (file) set("image", await fileToBase64(file));
  }

  function startEdit(dev) {
    setForm({
      id: dev.id,
      phaseNumber: dev.phaseNumber,
      title: dev.title,
      description: dev.description || "",
      image: dev.image || "",
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm());
    setEditing(false);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setToast("Add a title for the development.");
      return;
    }
    const payload = {
      phaseNumber: Number(form.phaseNumber),
      title: form.title,
      description: form.description,
      image: form.image,
    };
    try {
      if (editing && form.id) {
        await updateDevelopment(form.id, payload);
        setToast("Development updated.");
      } else {
        await createDevelopment(payload);
        setToast("Development added.");
      }
      resetForm();
      load();
    } catch (e) {
      console.error(e);
      setToast("Could not save. Try again.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this development?")) return;
    try {
      await deleteDevelopment(id);
      setToast("Development deleted.");
      load();
    } catch (e) {
      console.error(e);
      setToast("Could not delete.");
    }
  }

  // Group by phase for display
  const byPhase = {};
  developments.forEach((d) => {
    (byPhase[d.phaseNumber] ||= []).push(d);
  });
  const phaseNumbers = Object.keys(byPhase)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="sg-page">
      <h1 className="sg-page-title">Phases &amp; developments</h1>
      <p className="sg-page-sub">
        Build the catalogue once. These developments can then be assigned to any
        Smart Gaon village with a completion percentage.
      </p>

      {/* ── Create / Edit form ── */}
      <div className="sg-card">
        <p className="sg-card-title">
          {editing ? "Edit development" : "Add a development"}
        </p>

        <div className="sg-field">
          <label>Phase number</label>
          <input
            type="number"
            min={1}
            className="sg-input"
            value={form.phaseNumber}
            onChange={(e) => set("phaseNumber", e.target.value)}
            disabled={editing}
            style={
              editing
                ? { background: "#f3f4f6", cursor: "not-allowed" }
                : undefined
            }
          />
          {editing && (
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0" }}>
              Phase can't be changed after a development is created.
            </p>
          )}
        </div>

        <div className="sg-field">
          <label>Title</label>
          <input
            type="text"
            className="sg-input"
            placeholder="e.g. Road Construction"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="sg-field">
          <label>Description</label>
          <textarea
            className="sg-textarea"
            placeholder="What does this development cover?"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="sg-field">
          <label>Image</label>
          <div className="sg-attach-row">
            <label className="sg-attach-btn">
              📷 Choose image
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImage}
              />
            </label>
            {form.image && (
              <img className="sg-thumb" src={form.image} alt="" />
            )}
          </div>
        </div>

        <div className="sg-actions">
          {editing && (
            <button className="sg-btn sg-btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
          <button className="sg-btn sg-btn-primary" onClick={handleSubmit}>
            {editing ? "Update development" : "Add development"}
          </button>
        </div>
      </div>

      {/* ── Existing catalogue ── */}
      {loading ? (
        <p className="sg-empty">Loading…</p>
      ) : phaseNumbers.length === 0 ? (
        <div className="sg-card">
          <p className="sg-empty">
            No developments yet. Add your first one above.
          </p>
        </div>
      ) : (
        phaseNumbers.map((ph) => (
          <div className="sg-card" key={ph}>
            <p className="sg-card-title">Phase {ph}</p>
            <div className="sg-dev-grid">
              {byPhase[ph].map((dev) => (
                <div className="sg-dev-card" key={dev.id}>
                  {dev.image ? (
                    <img className="sg-dev-img" src={dev.image} alt="" />
                  ) : (
                    <div className="sg-dev-img-ph">🏗️</div>
                  )}
                  <div className="sg-dev-body">
                    <p className="sg-dev-title">{dev.title}</p>
                    <div className="sg-actions" style={{ marginTop: 10 }}>
                      <button
                        className="sg-btn sg-btn-ghost sg-btn-sm"
                        onClick={() => startEdit(dev)}
                      >
                        Edit
                      </button>
                      <button
                        className="sg-btn sg-btn-danger sg-btn-sm"
                        onClick={() => handleDelete(dev.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
