
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

//   // ✅ For Image Preview
//   const [previewImage, setPreviewImage] = useState(null);

//   // ✅ For View More / View Less
//   const [expandedId, setExpandedId] = useState(null);

//   return (
//     <>

//       {/* ================= IMAGE MODAL ================= */}
//       {previewImage && (
//         <div
//           className="gc-image-modal"
//           onClick={() => setPreviewImage(null)}
//         >
//           <img src={previewImage} alt="Preview" />
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

//             const media = item.mediaAttachments || [];
//             // const image = media.find((m) => !isVideo(m));
//             const images = media.filter((m) => !isVideo(m));
//             return (
//               <tr key={item.postId}>

//                 {/* USER */}
//                 <td>
//                   {item.user
//                     ? `${item.user.firstName} ${item.user.lastName}`
//                     : "—"}
//                 </td>

//                 <td>{item.user?.phone || "—"}</td>


//                 {/* MEDIA */}
//                 {/* <td>
//                   {image ? (
//                     <img
//                       src={image}
//                       alt="post"
//                       className="gc-table-image"
//                       style={{ cursor: "pointer" }}
//                       onClick={() => setPreviewImage(image)}
//                     />
//                   ) : (
//                     "—"
//                   )}
//                 </td> */}
              
//               <td className="gc-media-cell">

//   {images.length > 0 ? (

//     images.map((img, index) => (
//       <img
//         key={index}
//         src={img}
//         alt="post"
//         className="gc-table-image"
//         onClick={() => setPreviewImage(img)}
//         style={{ cursor: "pointer", marginRight: "5px" }}
//       />
//     ))

//   ) : (
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
//                            className="gc-view-more"
//                             onClick={() =>
//                               setExpandedId(
//                                 isExpanded ? null : item.postId
//                               )
//                             }
//                             // style={{
//                             //   color: "#1f7a1f",
//                             //   font-size: "12px",
//                             //   cursor: "pointer",
//                             //   marginLeft: "6px",
//                             //   fontWeight: "200",
//                             // }}
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

  // ✅ Gallery Modal State
  const [previewMedia, setPreviewMedia] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState({});

  // ✅ View More State
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

            {previewMedia.map((item, index) => (

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

            ))}

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
            <th>Action</th>
          </tr>
        </thead>


        <tbody>

          {items.length === 0 && (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No posts found
              </td>
            </tr>
          )}


          {items.map((item) => {

            /* ====== HANDLE MULTIPLE MEDIA ====== */
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

                {/* USER */}
                <td>
                  {item.user
                    ? `${item.user.firstName} ${item.user.lastName}`
                    : "—"}
                </td>

                <td>{item.user?.phone || "—"}</td>


                {/* MEDIA COLUMN */}
              <td className="gc-media-cell">

  {allMedia.length > 0 ? (() => {

    const current = mediaIndex[item.postId] || 0;
    const currentFile = allMedia[current];

    return (

      <div className="gc-mini-carousel">

        {/* LEFT */}
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

        {/* MEDIA */}
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

        {/* RIGHT */}
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


                {/* TITLE */}
                <td>{item.title}</td>


                {/* CONTENT WITH VIEW MORE */}
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


                {/* CATEGORY */}
                <td>{item.category || "—"}</td>


                {/* LIKES & COMMENTS */}
                <td>{item.likeCount ?? 0}</td>
                <td>{item.commentCount ?? 0}</td>


                {/* REPORT */}
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


                {/* CREATED */}
                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </td>


                {/* ACTION */}
                <td>
                  <button
                    className="gc-btn-delete"
                    onClick={() => onDelete(item.postId)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>
    </>
  );
};

export default ForumTable;
