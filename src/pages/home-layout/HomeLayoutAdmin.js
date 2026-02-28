// import React, { useEffect, useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import { api } from "../../pages/gaonconnect/services/apiConfig";
// import "./homeLayoutAdmin.css";

// const API_BASE = "/admin";

// const authHeader = () => ({
//   headers: {
//     Authorization: "Bearer " + localStorage.getItem("adminToken"),
//   },
// });

// const HomeLayoutAdmin = () => {
//   const [sections, setSections] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // add section state
//   const [newKey, setNewKey] = useState("");
//   const [newTitle, setNewTitle] = useState("");

//   useEffect(() => {
//     loadLayout();
//   }, []);

//   /* ================= LOAD ================= */
//   const loadLayout = async () => {
//     try {
//       const res = await api.get(
//         `${API_BASE}/home-layout`,
//         authHeader()
//       );

//       const data = res.data || [];
//       setSections([...data].sort((a, b) => a.order - b.order));
//     } catch (err) {
//       console.error("Failed to load layout", err);
//       alert("Failed to load layout or unauthorized");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= ADD SECTION ================= */
//   const addSection = () => {
//     if (!newKey.trim() || !newTitle.trim()) {
//       alert("Section key and title are required");
//       return;
//     }

//     if (sections.some((s) => s.id === newKey.trim())) {
//       alert("Section key already exists");
//       return;
//     }

//     setSections((prev) => [
//       ...prev,
//       {
//         id: newKey.trim(),
//         title: newTitle.trim(),
//         visible: false,
//         order: prev.length + 1,
//       },
//     ]);

//     setNewKey("");
//     setNewTitle("");
//   };

//   /* ================= DRAG ================= */
//   const onDragEnd = (result) => {
//     if (!result.destination) return;

//     const items = Array.from(sections);
//     const [moved] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, moved);

//     setSections(
//       items.map((item, index) => ({
//         ...item,
//         order: index + 1,
//       }))
//     );
//   };

//   /* ================= TOGGLE ================= */
//   const toggleVisible = (id) => {
//     setSections((prev) =>
//       prev.map((s) =>
//         s.id === id ? { ...s, visible: !s.visible } : s
//       )
//     );
//   };

//   /* ================= SAVE ================= */
//   const saveLayout = async () => {
//     setSaving(true);
//     try {
//       await api.post(
//         `${API_BASE}/home-layout`,
//         sections.map((s) => ({
//           sectionKey: s.id,
//           title: s.title,
//           visible: s.visible,
//           displayOrder: s.order,
//         })),
//         authHeader()
//       );

//       alert("Home layout saved successfully");
//     } catch (err) {
//       console.error("Save failed", err);
//       alert("Failed to save layout or unauthorized");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <p style={{ padding: 20 }}>Loading layout...</p>;
//   }

//   return (
//     <div className="home-layout-admin">
//       {/* HEADER */}
//       <div className="hla-header">
//         <h2>🏠 Home Screen Layout</h2>
//         <p>
//           Drag to reorder, toggle visibility, or add new services dynamically.
//         </p>
//       </div>

//       {/* ADD SECTION */}
//       <div className="hla-add">
//         <input
//           placeholder="section key (e.g. gov_schemes)"
//           value={newKey}
//           onChange={(e) => setNewKey(e.target.value)}
//         />
//         <input
//           placeholder="Title (e.g. Government Schemes)"
//           value={newTitle}
//           onChange={(e) => setNewTitle(e.target.value)}
//         />
//         <button onClick={addSection}>Add</button>
//       </div>

//       {/* LIST */}
//       <div className="hla-list">
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="sections">
//             {(provided) => (
//               <div ref={provided.innerRef} {...provided.droppableProps}>
//                 {sections.map((section, index) => (
//                   <Draggable
//                     key={section.id}
//                     draggableId={section.id}
//                     index={index}
//                   >
//                     {(provided) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                         className="hla-card"
//                         style={provided.draggableProps.style}
//                       >
//                         <div className="hla-left">
//                           <strong>{section.title}</strong>
//                           <span className="hla-key">{section.id}</span>
//                         </div>

//                         <label className="hla-toggle">
//                           <input
//                             type="checkbox"
//                             checked={section.visible}
//                             onChange={() => toggleVisible(section.id)}
//                           />
//                           <span>Visible</span>
//                         </label>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>

//       {/* FOOTER */}
//       <div className="hla-footer">
//         <button
//           className="hla-save-btn"
//           onClick={saveLayout}
//           disabled={saving}
//         >
//           {saving ? "Saving..." : "Save Layout"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default HomeLayoutAdmin;


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

const HomeLayoutAdmin = () => {

  // ✅ GET ROLE
  const role = localStorage.getItem("adminRole");

  // ✅ ONLY SUPER + STATE CAN MANAGE
  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadLayout();
  }, []);

  /* ================= LOAD ================= */
  const loadLayout = async () => {
    try {
      const res = await api.get(
        `${API_BASE}/home-layout`,
        authHeader()
      );

      const data = res.data || [];

      setSections(
        [...data].sort(
          (a, b) =>
            (a.displayOrder || a.order) -
            (b.displayOrder || b.order)
        )
      );
    } catch (err) {
      console.error("Failed to load layout", err);
      alert("Failed to load layout or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD SECTION ================= */
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
      {
        id: newKey.trim(),
        title: newTitle.trim(),
        visible: false,
        order: prev.length + 1,
      },
    ]);

    setNewKey("");
    setNewTitle("");
  };

  /* ================= DRAG ================= */
  const onDragEnd = (result) => {
    if (!canManage) return;
    if (!result.destination) return;

    const items = Array.from(sections);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setSections(
      items.map((item, index) => ({
        ...item,
        order: index + 1,
      }))
    );
  };

  /* ================= TOGGLE ================= */
  const toggleVisible = (id) => {
    if (!canManage) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      )
    );
  };

  /* ================= SAVE ================= */
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
    return <p style={{ padding: 20 }}>Loading layout...</p>;
  }

  return (
    <div className="home-layout-admin">

      {/* HEADER */}
      <div className="hla-header">
        <h2>🏠 Home Screen Layout</h2>
        <p>Drag to reorder and toggle visibility.</p>
      </div>

      {/* ADD SECTION (ONLY SUPER + STATE) */}
      {canManage && (
        <div className="hla-add">
          <input
            placeholder="section key (e.g. gov_schemes)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            placeholder="Title (e.g. Government Schemes)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={addSection}>Add</button>
        </div>
      )}

      {/* LIST */}
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
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(canManage ? provided.dragHandleProps : {})}
                        className="hla-card"
                        style={provided.draggableProps.style}
                      >
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
                          <span>Visible</span>
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

      {/* SAVE BUTTON (ONLY SUPER + STATE) */}
      {canManage && (
        <div className="hla-footer">
          <button
            className="hla-save-btn"
            onClick={saveLayout}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      )}

    </div>
  );
};

export default HomeLayoutAdmin;