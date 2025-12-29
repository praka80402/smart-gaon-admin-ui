// // src/pages/communityNews/tabs/ViewEvents.jsx
// import React, { useEffect, useState } from "react";
// import { getAllEvents, deleteEvent, updateEvent, updateEventWithMedia } from "../../../services/eventsService";
// import PostedItem from "../PostedItem";
// import EditModal from "../EditModal";

// export default function ViewEvents() {
//   const [items, setItems] = useState([]);
//   const [editing, setEditing] = useState(null);
//   const [editVisible, setEditVisible] = useState(false);

//   const load = async () => {
//     const res = await getAllEvents(0, 50);
//     setItems(res.data || []);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   return (
//     <div className="cn-list">
//       <h2>Events List</h2>

//       <div className="cn-grid">
//         {items.map((it) => (
//           <PostedItem
//             key={it.id}
//             item={it}
//             type="Event"
//             onEdit={() => { setEditing(it); setEditVisible(true); }}
//             onDelete={async () => { await deleteEvent(it.id); load(); }}
//           />
//         ))}
//       </div>

//       <EditModal
//         visible={editVisible}
//         onClose={() => setEditVisible(false)}
//         initial={editing}
//         type="Event"
//         onSave={async (payload, media) => {
//           if (media?.newImages?.length || media?.newVideo || media?.removedImageUrls?.length) {
//             await updateEventWithMedia(payload.id, payload, media.newImages, media.newVideo, media.removedImageUrls);
//           } else {
//             await updateEvent(payload.id, payload);
//           }
//           setEditVisible(false);
//           load();
//         }}
//       />
//     </div>
//   );
// }

// src/pages/communityNews/tabs/ViewEvents.jsx
import React, { useEffect, useState } from "react";
import {
  getAllEvents,
  deleteEvent,
  updateEvent,
  updateEventWithMedia,
} from "../../../services/eventsService";
import EditModal from "../EditModal";

export default function ViewEvents() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const [viewItem, setViewItem] = useState(null); // VIEW MODAL

  const load = async () => {
    const res = await getAllEvents(0, 50);
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="cn-list">
      <h2>Events List</h2>

      {/* TABLE */}
      <table className="cn-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>View</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.title}</td>

              <td>{(it.description || "").slice(0, 80)}...</td>

              {/* VIEW BUTTON */}
              <td className="cn-center">
                <button className="view-btn" onClick={() => setViewItem(it)}>
                  View
                </button>
              </td>

              {/* EDIT + DELETE */}
              <td>
                <div className="cn-action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditing(it);
                      setEditVisible(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={async () => {
                      await deleteEvent(it.id);
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      <EditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        initial={editing}
        type="Event"
        onSave={async (payload, media) => {
          if (
            media?.newImages?.length ||
            media?.newVideo ||
            media?.removedImageUrls?.length
          ) {
            await updateEventWithMedia(
              payload.id,
              payload,
              media.newImages,
              media.newVideo,
              media.removedImageUrls
            );
          } else {
            await updateEvent(payload.id, payload);
          }
          setEditVisible(false);
          load();
        }}
      />

      {/* VIEW MODAL */}
      {viewItem && (
        <div
          className="cn-modal-backdrop"
          onClick={() => setViewItem(null)}
        >
          <div
            className="cn-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{viewItem.title}</h3>

            <p>{viewItem.description}</p>

            {/* IMAGES */}
            {viewItem.imageUrls?.length > 0 && (
              <div className="cn-view-images">
                {viewItem.imageUrls.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
              </div>
            )}

            {/* VIDEO */}
            {viewItem.videoUrl && (
              <video controls className="cn-video" src={viewItem.videoUrl} />
            )}

            <button className="close-btn" onClick={() => setViewItem(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
