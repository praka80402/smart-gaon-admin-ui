
// import React, { useState } from "react";
// import "./forum.css";

// /* ====== CONTENT WORD LIMIT ====== */
// const getWords = (text, count = 5) => {
//   if (!text) return "";

//   const words = text.split(" ");

//   return {
//     short: words.slice(0, count).join(" "),
//     full: text,
//     isLong: words.length > count,
//   };
// };

// const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

// const ForumTable = ({ items, onDelete, onViewReports }) => {

//   // ✅ Gallery Modal State
//   const [previewMedia, setPreviewMedia] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);
//   const [mediaIndex, setMediaIndex] = useState({});

//   // ✅ View More State
//   const [expandedId, setExpandedId] = useState(null);

//   return (
//     <>

//       {/* ================= GALLERY MODAL ================= */}
//       {previewMedia.length > 0 && (
//         <div
//           className="gc-image-modal"
//           onClick={() => setPreviewMedia([])}
//         >
//           <div
//             className="gc-gallery"
//             onClick={(e) => e.stopPropagation()}
//             ref={(el) => {
//               if (el && el.children[startIndex]) {
//                 el.children[startIndex].scrollIntoView({
//                   behavior: "smooth",
//                   inline: "center",
//                 });
//               }
//             }}
//           >

//             {previewMedia.map((item, index) => (

//               isVideo(item) ? (

//                 <video
//                   key={index}
//                   src={item}
//                   controls
//                   className="gc-gallery-video"
//                 />

//               ) : (

//                 <img
//                   key={index}
//                   src={item}
//                   alt="preview"
//                   className="gc-gallery-image"
//                 />

//               )

//             ))}

//           </div>
//         </div>
//       )}


//       {/* ================= TABLE ================= */}
//       <table className="gc-table">

//         <thead>
//           <tr>
//             <th>User</th>
//             <th>Phone</th>
//             <th>Media</th>
//             <th>Title</th>
//             <th>Content</th>
//             <th>Category</th>
//             <th>Likes</th>
//             <th>Comments</th>
//             <th>Reports</th>
//             <th>Created</th>
//             <th>Action</th>
//           </tr>
//         </thead>


//         <tbody>

//           {items.length === 0 && (
//             <tr>
//               <td colSpan="11" style={{ textAlign: "center" }}>
//                 No posts found
//               </td>
//             </tr>
//           )}


//           {items.map((item) => {

//             /* ====== HANDLE MULTIPLE MEDIA ====== */
//             const media = Array.isArray(item.mediaAttachments)
//               ? item.mediaAttachments
//               : item.mediaAttachments
//               ? [item.mediaAttachments]
//               : [];

//             const allMedia = media
//               .map((m) => (typeof m === "string" ? m : m?.url))
//                .filter((m) => m);


//             return (
//               <tr key={item.postId}>

//                 {/* USER */}
//                 <td>
//                   {item.user
//                     ? `${item.user.firstName} ${item.user.lastName}`
//                     : "—"}
//                 </td>

//                 <td>{item.user?.phone || "—"}</td>


//                 {/* MEDIA COLUMN */}
//               <td className="gc-media-cell">

//   {allMedia.length > 0 ? (() => {

//     const current = mediaIndex[item.postId] || 0;
//     const currentFile = allMedia[current];

//     return (

//       <div className="gc-mini-carousel">

//         {/* LEFT */}
//         {allMedia.length > 1 && (
//           <button
//             className="gc-carousel-btn"
//             onClick={() =>
//               setMediaIndex((p) => ({
//                 ...p,
//                 [item.postId]:
//                   current === 0 ? allMedia.length - 1 : current - 1,
//               }))
//             }
//           >
//             ‹
//           </button>
//         )}

//         {/* MEDIA */}
//         <div
//           className="gc-carousel-preview"
//           onClick={() => {
//             setPreviewMedia(allMedia);
//             setStartIndex(current);
//           }}
//         >

//           {isVideo(currentFile) ? (

//             <video
//               src={currentFile}
//               muted
//               className="gc-video-thumb"
//             />

//           ) : (

//             <img
//               src={currentFile}
//               className="gc-table-image"
//               alt="post"
//             />

//           )}

//         </div>

//         {/* RIGHT */}
//         {allMedia.length > 1 && (
//           <button
//             className="gc-carousel-btn"
//             onClick={() =>
//               setMediaIndex((p) => ({
//                 ...p,
//                 [item.postId]:
//                   current === allMedia.length - 1 ? 0 : current + 1,
//               }))
//             }
//           >
//             ›
//           </button>
//         )}

//       </div>
//     );

//   })() : (
//     "—"
//   )}

// </td>


//                 {/* TITLE */}
//                 <td>{item.title}</td>


//                 {/* CONTENT WITH VIEW MORE */}
//                 <td>
//                   {(() => {

//                     const { short, full, isLong } = getWords(item.content, 5);

//                     const isExpanded = expandedId === item.postId;

//                     return (
//                       <>
//                         {isExpanded ? full : short}

//                         {isLong && (
//                           <span
//                             className="gc-view-more"
//                             onClick={() =>
//                               setExpandedId(
//                                 isExpanded ? null : item.postId
//                               )
//                             }
//                           >
//                             {isExpanded ? "View Less" : "View More"}
//                           </span>
//                         )}
//                       </>
//                     );
//                   })()}
//                 </td>


//                 {/* CATEGORY */}
//                 <td>{item.category || "—"}</td>


//                 {/* LIKES & COMMENTS */}
//                 <td>{item.likeCount ?? 0}</td>
//                 <td>{item.commentCount ?? 0}</td>


//                 {/* REPORT */}
//                 <td>
//                   <b>{Number(item.reportCount ?? 0)}</b>

//                   {Number(item.reportCount ?? 0) > 0 && (
//                     <button
//                       className="gc-btn-view"
//                       onClick={() => onViewReports(item.postId)}
//                     >
//                       View
//                     </button>
//                   )}
//                 </td>


//                 {/* CREATED */}
//                 <td>
//                   {item.createdAt
//                     ? new Date(item.createdAt).toLocaleDateString()
//                     : "—"}
//                 </td>


//                 {/* ACTION */}
//                 <td>
//                   <button
//                     className="gc-btn-delete"
//                     onClick={() => onDelete(item.postId)}
//                   >
//                     Delete
//                   </button>
//                 </td>

//               </tr>
//             );
//           })}

//         </tbody>

//       </table>
//     </>
//   );
// };

// export default ForumTable;


import React, { useState } from "react";
import "./forum.css";

/* ====== CONTENT WORD LIMIT ====== */
const getWords = (text, count = 5) => {
  if (!text) return "";

  const words = text.split(" ");

  return {
    short: words.slice(0, count).join(" "),
    full: text,
    isLong: words.length > count,
  };
};

const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

const ForumTable = ({ items, onDelete, onViewReports }) => {

  const role = localStorage.getItem("adminRole");

  const canDelete =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [previewMedia, setPreviewMedia] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  return (
    <>
      {/* ================= GALLERY MODAL ================= */}
      {previewMedia.length > 0 && (
        <div
          className="gc-image-modal"
          onClick={() => setPreviewMedia([])}
        >
          <div
            className="gc-gallery"
            onClick={(e) => e.stopPropagation()}
            ref={(el) => {
              if (el && el.children[startIndex]) {
                el.children[startIndex].scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                });
              }
            }}
          >
            {previewMedia.map((item, index) =>
              isVideo(item) ? (
                <video
                  key={index}
                  src={item}
                  controls
                  className="gc-gallery-video"
                />
              ) : (
                <img
                  key={index}
                  src={item}
                  alt="preview"
                  className="gc-gallery-image"
                />
              )
            )}
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <table className="gc-table">

        <thead>
          <tr>
            <th>User</th>
            <th>Phone</th>
            <th>Media</th>
            <th>Title</th>
            <th>Content</th>
            <th>Category</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Reports</th>
            <th>Created</th>
            {canDelete && <th>Action</th>}
          </tr>
        </thead>

        <tbody>

          {items.length === 0 && (
            <tr>
              <td colSpan={canDelete ? "11" : "10"} style={{ textAlign: "center" }}>
                No posts found
              </td>
            </tr>
          )}

          {items.map((item) => {

            const media = Array.isArray(item.mediaAttachments)
              ? item.mediaAttachments
              : item.mediaAttachments
              ? [item.mediaAttachments]
              : [];

            const allMedia = media
              .map((m) => (typeof m === "string" ? m : m?.url))
              .filter((m) => m);

            return (
              <tr key={item.postId}>

                <td>
                  {item.user
                    ? `${item.user.firstName} ${item.user.lastName}`
                    : "—"}
                </td>

                <td>{item.user?.phone || "—"}</td>

                {/* MEDIA */}
                <td className="gc-media-cell">

                  {allMedia.length > 0 ? (() => {

                    const current = mediaIndex[item.postId] || 0;
                    const currentFile = allMedia[current];

                    return (
                      <div className="gc-mini-carousel">

                        {allMedia.length > 1 && (
                          <button
                            className="gc-carousel-btn"
                            onClick={() =>
                              setMediaIndex((p) => ({
                                ...p,
                                [item.postId]:
                                  current === 0 ? allMedia.length - 1 : current - 1,
                              }))
                            }
                          >
                            ‹
                          </button>
                        )}

                        <div
                          className="gc-carousel-preview"
                          onClick={() => {
                            setPreviewMedia(allMedia);
                            setStartIndex(current);
                          }}
                        >
                          {isVideo(currentFile) ? (
                            <video
                              src={currentFile}
                              muted
                              className="gc-video-thumb"
                            />
                          ) : (
                            <img
                              src={currentFile}
                              className="gc-table-image"
                              alt="post"
                            />
                          )}
                        </div>

                        {allMedia.length > 1 && (
                          <button
                            className="gc-carousel-btn"
                            onClick={() =>
                              setMediaIndex((p) => ({
                                ...p,
                                [item.postId]:
                                  current === allMedia.length - 1 ? 0 : current + 1,
                              }))
                            }
                          >
                            ›
                          </button>
                        )}

                      </div>
                    );

                  })() : (
                    "—"
                  )}

                </td>

                <td>{item.title}</td>

                {/* CONTENT */}
                <td>
                  {(() => {
                    const { short, full, isLong } = getWords(item.content, 5);
                    const isExpanded = expandedId === item.postId;

                    return (
                      <>
                        {isExpanded ? full : short}

                        {isLong && (
                          <span
                            className="gc-view-more"
                            onClick={() =>
                              setExpandedId(
                                isExpanded ? null : item.postId
                              )
                            }
                          >
                            {isExpanded ? "View Less" : "View More"}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </td>

                <td>{item.category || "—"}</td>

                <td>{item.likeCount ?? 0}</td>
                <td>{item.commentCount ?? 0}</td>

                <td>
                  <b>{Number(item.reportCount ?? 0)}</b>

                  {Number(item.reportCount ?? 0) > 0 && (
                    <button
                      className="gc-btn-view"
                      onClick={() => onViewReports(item.postId)}
                    >
                      View
                    </button>
                  )}
                </td>

                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </td>

                {/* DELETE ONLY FOR SUPER + STATE */}
                {canDelete && (
                  <td>
                    <button
                      className="gc-btn-delete"
                      onClick={() => {
                        if (!canDelete) {
                          alert("Not authorized");
                          return;
                        }
                        onDelete(item.postId);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}

              </tr>
            );
          })}

        </tbody>

      </table>
    </>
  );
};

export default ForumTable;