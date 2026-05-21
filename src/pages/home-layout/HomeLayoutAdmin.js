
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { api } from "../../pages/gaonconnect/services/apiConfig";
import "./homeLayoutAdmin.css";

const API_BASE = "/admin";

const authHeader = () => ({
  headers: {
    Authorization: "Bearer " + localStorage.getItem("adminToken"),
  },
});

/* ─────────────────────────────────────────
   HomeLayoutAdmin — controlled by Dashboard
   Props: onClose  (called by Cancel / ✕)
───────────────────────────────────────── */
const HomeLayoutAdmin = ({ onClose }) => {
  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadLayout();
  }, []);

  /* ── LOAD ── */
  const loadLayout = async () => {
    try {
      const res = await api.get(`${API_BASE}/home-layout`, authHeader());
      const data = res.data || [];
      setSections(
        [...data].sort(
          (a, b) => (a.displayOrder || a.order) - (b.displayOrder || b.order)
        )
      );
    } catch (err) {
      console.error("Failed to load layout", err);
      alert("Failed to load layout or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  /* ── ADD ── */
  const addSection = () => {
    if (!canManage) return;
    if (!newKey.trim() || !newTitle.trim()) {
      alert("Section key and title are required");
      return;
    }
    if (sections.some((s) => s.id === newKey.trim())) {
      alert("Section key already exists");
      return;
    }
    setSections((prev) => [
      ...prev,
      { id: newKey.trim(), title: newTitle.trim(), visible: false, order: prev.length + 1 },
    ]);
    setNewKey("");
    setNewTitle("");
  };

  /* ── DRAG ── */
  const onDragEnd = (result) => {
    if (!canManage || !result.destination) return;
    const items = Array.from(sections);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSections(items.map((item, index) => ({ ...item, order: index + 1 })));
  };

  /* ── TOGGLE ── */
  const toggleVisible = (id) => {
    if (!canManage) return;
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  /* ── SAVE ── */
  const saveLayout = async () => {
    if (!canManage) return;
    setSaving(true);
    try {
      await api.post(
        `${API_BASE}/home-layout`,
        sections.map((s) => ({
          sectionKey: s.id,
          title: s.title,
          visible: s.visible,
          displayOrder: s.order,
        })),
        authHeader()
      );
      alert("Home layout saved successfully");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save layout or unauthorized");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="hla-loading">
        <span className="hla-spinner" />
        <p>Loading layout…</p>
      </div>
    );
  }

  return (
    <div className="hla-panel">

      {/* ── HEADER ── */}
      <div className="hla-modal-header">
        <div>
          <h2>🏠 Home Screen Layout</h2>
          <p>Drag to reorder · toggle visibility</p>
        </div>
        {onClose && (
          <button className="hla-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}
      </div>

      {/* ── ADD SECTION ── */}
      {canManage && (
        <div className="hla-add">
          <input
            placeholder="Section key (e.g. gov_schemes)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            placeholder="Title (e.g. Government Schemes)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={addSection}>+ Add</button>
        </div>
      )}

      {/* ── DRAG LIST ── */}
      <div className="hla-list">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                    isDragDisabled={!canManage}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(canManage ? provided.dragHandleProps : {})}
                        className={`hla-card${snapshot.isDragging ? " hla-card--dragging" : ""}`}
                        style={provided.draggableProps.style}
                      >
                        {canManage && <span className="hla-drag-icon">⠿</span>}

                        <div className="hla-left">
                          <strong>{section.title}</strong>
                          <span className="hla-key">{section.id}</span>
                        </div>

                        <label className="hla-toggle">
                          <input
                            type="checkbox"
                            checked={section.visible}
                            disabled={!canManage}
                            onChange={() => toggleVisible(section.id)}
                          />
                          <span className="hla-slider" />
                          <span className="hla-toggle-label">
                            {section.visible ? "Visible" : "Hidden"}
                          </span>
                        </label>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ── FOOTER ── */}
      {canManage && (
        <div className="hla-footer">
          {onClose && (
            <button className="hla-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          )}
          <button className="hla-save-btn" onClick={saveLayout} disabled={saving}>
            {saving ? "Saving…" : "Save Layout"}
          </button>
        </div>
      )}

    </div>
  );
};

export default HomeLayoutAdmin;

