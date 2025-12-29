// // src/pages/communityNews/tabs/ViewNews.jsx
// import React, { useEffect, useState } from "react";
// import { getAllNews, deleteNews, updateNews, updateNewsWithMedia } from "../../../services/newsService";
// import PostedItem from "../PostedItem";
// import EditModal from "../EditModal";

// export default function ViewNews() {
//   const [items, setItems] = useState([]);
//   const [editing, setEditing] = useState(null);
//   const [editVisible, setEditVisible] = useState(false);

//   const load = async () => {
//     const res = await getAllNews(0, 50);
//     setItems(res.data || []);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   return (
//     <div className="cn-list">
//       <h2>News List</h2>

//       <div className="cn-grid">
//         {items.map((it) => (
//           <PostedItem
//             key={it.id}
//             item={it}
//             type="News"
//             onEdit={() => { setEditing(it); setEditVisible(true); }}
//             onDelete={async () => { await deleteNews(it.id); load(); }}
//           />
//         ))}
//       </div>

//       <EditModal
//         visible={editVisible}
//         onClose={() => setEditVisible(false)}
//         initial={editing}
//         type="News"
//         onSave={async (payload, media) => {
//           if (media?.newImages?.length || media?.newVideo || media?.removedImageUrls?.length) {
//             await updateNewsWithMedia(payload.id, payload, media.newImages, media.newVideo, media.removedImageUrls);
//           } else {
//             await updateNews(payload.id, payload);
//           }
//           setEditVisible(false);
//           load();
//         }}
//       />
//     </div>
//   );
// }

// src/pages/communityNews/tabs/ViewNews.jsx
import React, { useEffect, useState } from "react";
import {
  getAllNews,
  deleteNews,
  updateNews,
  updateNewsWithMedia,
} from "../../../services/newsService";
import EditModal from "../EditModal";

export default function ViewNews() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const [viewItem, setViewItem] = useState(null); // View modal

  const load = async () => {
    const res = await getAllNews(0, 50);
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="cn-list">
      <h2>News List</h2>

      {/* TABLE */}
      <table className="cn-table">
  <thead>
    <tr>
      <th>Headline</th>
      <th>Body</th>
      <th>View</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {items.map((it) => (
      <tr key={it.id}>
        <td>{it.title}</td>

        <td>{(it.summary || it.description || "").slice(0, 80)}...</td>

        {/* VIEW BUTTON COLUMN */}
        <td className="cn-center">
          <button
            className="view-btn"
            onClick={() => setViewItem(it)}
          >
            View
          </button>
        </td>

        {/* ACTIONS COLUMN */}
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
                await deleteNews(it.id);
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
        type="News"
        onSave={async (payload, media) => {
          if (
            media?.newImages?.length ||
            media?.newVideo ||
            media?.removedImageUrls?.length
          ) {
            await updateNewsWithMedia(
              payload.id,
              payload,
              media.newImages,
              media.newVideo,
              media.removedImageUrls
            );
          } else {
            await updateNews(payload.id, payload);
          }
          setEditVisible(false);
          load();
        }}
      />

      {/* VIEW MODAL */}
      {viewItem && (
        <div className="cn-modal-backdrop" onClick={() => setViewItem(null)}>
          <div className="cn-view-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewItem.title}</h3>
            <p>{viewItem.content || viewItem.description}</p>

            {viewItem.imageUrls?.length > 0 && (
              <div className="cn-view-images">
                {viewItem.imageUrls.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
              </div>
            )}

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
