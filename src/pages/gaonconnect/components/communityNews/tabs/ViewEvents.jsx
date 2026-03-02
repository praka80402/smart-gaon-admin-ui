// import React, { useEffect, useState } from "react";
// import {
//   getAllEvents,
//   deleteEvent,
//   updateEvent,
//   updateEventWithMedia,
// } from "../../../services/eventsService";
// import EditModal from "../EditModal";

// export default function ViewEvents() {
//   const [items, setItems] = useState([]);
//   const [editing, setEditing] = useState(null);
//   const [editVisible, setEditVisible] = useState(false);
//   const [viewItem, setViewItem] = useState(null);

//   // PAGINATION
//   const [page, setPage] = useState(1);
//   const pageSize = 5;

//   const load = async () => {
//     const res = await getAllEvents(0, 50);
//     setItems(res.data || []);
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   useEffect(() => {
//     setPage(1);
//   }, [items]);

//   const totalPages = Math.ceil(items.length / pageSize);
//   const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

//   return (
//     <div className="cn-list">
//       <h2>Events List</h2>

//       <table className="cn-table">
//         <thead>
//           <tr>
//             <th>Title</th>
//             <th>Description</th>
//             <th>View</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {paginatedItems.map((it) => (
//             <tr key={it.id}>
//               <td>{it.title}</td>
//               <td>{(it.description || "").slice(0, 80)}...</td>

//               <td className="cn-center">
//                 <button className="view-btn" onClick={() => setViewItem(it)}>
//                   View
//                 </button>
//               </td>

//               <td>
//                 <div className="cn-action-buttons">
//                   <button
//                     className="edit-btn"
//                     onClick={() => {
//                       setEditing(it);
//                       setEditVisible(true);
//                     }}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="delete-btn"
//                     onClick={async () => {
//                       await deleteEvent(it.id);
//                       load();
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}

//           {paginatedItems.length === 0 && (
//             <tr>
//               <td colSpan="4" className="empty-row">No events found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* PAGINATION */}
// {totalPages > 1 && (
//   <div className="pagination">
    
//     <button
//       className="page-btn"
//       disabled={page === 1}
//       onClick={() => setPage(page - 1)}
//     >
//       Prev
//     </button>

//     <span className="current-page">{page}</span>

//     <button
//       className="page-btn"
//       disabled={page === totalPages}
//       onClick={() => setPage(page + 1)}
//     >
//       Next
//     </button>

//   </div>
// )}



//       {/* EDIT MODAL */}
//       <EditModal
//         visible={editVisible}
//         onClose={() => setEditVisible(false)}
//         initial={editing}
//         type="Event"
//         onSave={async (payload, media) => {
//           if (
//             media?.newImages?.length ||
//             media?.newVideo ||
//             media?.removedImageUrls?.length
//           ) {
//             await updateEventWithMedia(
//               payload.id,
//               payload,
//               media.newImages,
//               media.newVideo,
//               media.removedImageUrls
//             );
//           } else {
//             await updateEvent(payload.id, payload);
//           }
//           setEditVisible(false);
//           load();
//         }}
//       />

//       {/* VIEW MODAL */}
//       {viewItem && (
//         <div className="cn-modal-backdrop" onClick={() => setViewItem(null)}>
//           <div className="cn-view-modal" onClick={(e) => e.stopPropagation()}>
//             <h3>{viewItem.title}</h3>
//             <p>{viewItem.description}</p>

//             {viewItem.imageUrls?.length > 0 && (
//               <div className="cn-view-images">
//                 {viewItem.imageUrls.map((img, i) => (
//                   <img key={i} src={img} alt="" />
//                 ))}
//               </div>
//             )}

//             {viewItem.videoUrl && (
//               <video controls className="cn-video" src={viewItem.videoUrl} />
//             )}

//             <button className="close-btn" onClick={() => setViewItem(null)}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  getAllEvents,
  deleteEvent,
  updateEvent,
  updateEventWithMedia,
} from "../../../services/eventsService";
import EditModal from "../EditModal";

export default function ViewEvents() {

  const role = localStorage.getItem("adminRole");

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const load = async () => {
    const res = await getAllEvents(0, 50);
    setItems(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="cn-list">

      <h2>Events List</h2>

      <table className="cn-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>View</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>

          {paginatedItems.map((it) => (
            <tr key={it.id}>

              <td>{it.title}</td>
              <td>{(it.description || "").slice(0, 80)}...</td>

              <td className="cn-center">
               
                <button
  style={{
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
  onClick={() => setViewItem(it)}
>
  View
</button>
              </td>

              {canManage && (
                <td>
                  <div className="cn-action-buttons">

                    <button
                      className="edit-btn"
                      onClick={() => {
                        if (!canManage) return;
                        setEditing(it);
                        setEditVisible(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={async () => {
                        if (!canManage) return;

                        if (window.confirm("Delete this event?")) {
                          await deleteEvent(it.id);
                          load();
                        }
                      }}
                    >
                      Delete
                    </button>

                  </div>
                </td>
              )}

            </tr>
          ))}

          {paginatedItems.length === 0 && (
            <tr>
              <td
                colSpan={canManage ? "4" : "3"}
                className="empty-row"
              >
                No events found
              </td>
            </tr>
          )}

        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">

          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="current-page">{page}</span>

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

        </div>
      )}

      {/* EDIT MODAL (Only for allowed roles) */}
      {canManage && (
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
      )}

      {/* VIEW MODAL */}
      {/* {viewItem && (
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

            {viewItem.imageUrls?.length > 0 && (
              <div className="cn-view-images">
                {viewItem.imageUrls.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
              </div>
            )}

            {viewItem.videoUrl && (
              <video
                controls
                className="cn-video"
                src={viewItem.videoUrl}
              />
            )}

            <button
              className="close-btn"
              onClick={() => setViewItem(null)}
            >
              Close
            </button> */}

          {/* </div> */}
        {/* </div> */}
      {/* )} */}

      {/* VIEW MODAL */}
{viewItem && (
  <div
    onClick={() => setViewItem(null)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        width: "70%",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        padding: "25px",
        borderRadius: "8px",
        position: "relative"
      }}
    >
      {/* Circular Grey Close Button */}
      <button
        onClick={() => setViewItem(null)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          width: "35px",
          height: "35px",
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ✕
      </button>

      <h3>{viewItem.title}</h3>
      <p>{viewItem.description}</p>

      {viewItem.imageUrls?.length > 0 && (
        <div style={{ textAlign: "center" }}>
          {viewItem.imageUrls.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              style={{
                width: "250px",
                maxWidth: "100%",
                marginTop: "15px",
                borderRadius: "8px"
              }}
            />
          ))}
        </div>
      )}

      {viewItem.videoUrl && (
        <video
          controls
          src={viewItem.videoUrl}
          style={{ width: "100%", marginTop: "15px" }}
        />
      )}
    </div>
  </div>
)}

    </div>
  );
}